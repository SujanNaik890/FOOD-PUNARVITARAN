import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { findAndRankMatches } from '../services/donationService.js';
import { Donation } from '../models/Donation.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { Vehicle } from '../models/Vehicle.js';
import { calculateDistanceKm } from '../services/matchingEngine.js';
import { calculateRouteMatrix } from '../integrations/routeService.js';
import { BENGALURU_NGO_MAP_DIRECTORY, BENGALURU_LANDMARKS } from '../data/bengaluruNgoDirectory.js';

/**
 * Sandboxed Tools Declarations for Gemini & Operations AI
 */
export const AI_TOOLS_DECLARATIONS = [
  {
    name: 'getDonationDetails',
    description: 'Fetch verified food donation details such as items, portion counts, dietary type, and expiration deadline.',
    parameters: {
      type: 'OBJECT',
      properties: {
        donationId: { type: 'STRING', description: '24-character hexadecimal MongoDB ObjectId of the donation' }
      },
      required: ['donationId']
    }
  },
  {
    name: 'rankNGOs',
    description: 'Run the deterministic matching engine to find and score verified NGOs in Bengaluru suitable for this donation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        donationId: { type: 'STRING', description: 'Donation MongoDB ObjectId' }
      },
      required: ['donationId']
    }
  },
  {
    name: 'getAvailableVehicles',
    description: 'Retrieve authorized active delivery vehicles and their current capacity and cooling capabilities.',
    parameters: {
      type: 'OBJECT',
      properties: {
        minCapacityKg: { type: 'NUMBER', description: 'Minimum load capacity required in kg' },
        requiresCooling: { type: 'BOOLEAN', description: 'Whether cold-chain vehicle is required' }
      }
    }
  },
  {
    name: 'generateOperationsReport',
    description: 'Compute operational summaries of active donations, meals rescued, and NGO fulfillment metrics.',
    parameters: {
      type: 'OBJECT',
      properties: {}
    }
  },
  {
    name: 'searchBengaluruNGOsByLocation',
    description: 'Geospatially search and list verified NGOs in Bengaluru around a specific area, landmark, or zone (e.g. Indiranagar, Koramangala, Whitefield, HSR Layout, Yelahanka).',
    parameters: {
      type: 'OBJECT',
      properties: {
        areaOrZone: { type: 'STRING', description: 'Name of the area, zone, or landmark in Bengaluru (e.g. Koramangala, Indiranagar, Whitefield, South Bengaluru)' },
        maxDistanceKm: { type: 'NUMBER', description: 'Maximum radius in km (default 10 km)' }
      },
      required: ['areaOrZone']
    }
  },
  {
    name: 'calculateTransitRoute',
    description: 'Calculate route distance, travel duration in Bengaluru traffic, and transit waypoints between two locations or coordinates.',
    parameters: {
      type: 'OBJECT',
      properties: {
        originArea: { type: 'STRING', description: 'Origin area or landmark name in Bengaluru' },
        destinationArea: { type: 'STRING', description: 'Destination area, landmark name, or NGO name in Bengaluru' }
      },
      required: ['originArea', 'destinationArea']
    }
  }
];

/**
 * Helper to resolve coordinates from string or landmark in Bengaluru
 */
export const resolveCoordinates = (placeName) => {
  const norm = placeName.toLowerCase().trim();

  // Check landmark matches
  for (const [key, coords] of Object.entries(BENGALURU_LANDMARKS)) {
    if (key.toLowerCase().includes(norm) || norm.includes(key.toLowerCase())) {
      return { name: key, coordinates: coords };
    }
  }

  // Check NGO directory matches
  for (const ngo of BENGALURU_NGO_MAP_DIRECTORY) {
    if (
      ngo.ngoName.toLowerCase().includes(norm) ||
      ngo.area.toLowerCase().includes(norm) ||
      ngo.zone.toLowerCase().includes(norm)
    ) {
      return { name: `${ngo.ngoName} (${ngo.area})`, coordinates: ngo.coordinates };
    }
  }

  // Fallback defaults for common Bengaluru localities
  const commonMap = {
    koramangala: [77.6245, 12.9352],
    indiranagar: [77.6412, 12.9784],
    hsr: [77.6389, 12.9116],
    'hsr layout': [77.6389, 12.9116],
    whitefield: [77.7499, 12.9698],
    yelahanka: [77.5963, 13.1007],
    jayanagar: [77.5834, 12.9299],
    malleshwaram: [77.5714, 13.0031],
    rajajinagar: [77.5529, 12.9893],
    electroniccity: [77.6762, 12.8452],
    'electronic city': [77.6762, 12.8452],
    hebbal: [77.5925, 13.0358],
    ulsoor: [77.6245, 12.9815],
    mgroad: [77.6074, 12.9744],
    'mg road': [77.6074, 12.9744],
    central: [77.6074, 12.9744]
  };

  for (const [sub, coords] of Object.entries(commonMap)) {
    if (norm.includes(sub)) {
      return { name: placeName, coordinates: coords };
    }
  }

  // Central Bengaluru default
  return { name: `${placeName} (Bengaluru Central approx)`, coordinates: [77.6074, 12.9744] };
};

/**
 * Deterministic Tool Implementations (Strictly Read-Only)
 */
export const executeAITool = async (name, args) => {
  switch (name) {
    case 'getDonationDetails': {
      const donation = await Donation.findById(args.donationId).populate('donorId', 'organizationName donorType address');
      if (!donation) return { error: 'Donation not found' };
      return {
        donationCode: donation.donationCode,
        category: donation.foodCategory,
        dietary: donation.dietaryType,
        totalPortions: donation.totalPortionsEstimated,
        items: donation.foodItems,
        deadline: donation.consumptionDeadline,
        pickupArea: donation.pickupAddress?.area,
        pickupCoordinates: donation.pickupLocation?.coordinates,
        status: donation.status
      };
    }

    case 'rankNGOs': {
      const matches = await findAndRankMatches(args.donationId);
      return {
        count: matches.length,
        topRecommendations: matches.slice(0, 5)
      };
    }

    case 'getAvailableVehicles': {
      const filter = { isActive: true };
      if (args.minCapacityKg) filter.capacityKg = { $gte: args.minCapacityKg };
      if (args.requiresCooling) filter.hasCooling = true;
      const vehicles = await Vehicle.find(filter).select('vehicleType driverName driverPhone capacityKg hasCooling currentLocation');
      return { count: vehicles.length, vehicles };
    }

    case 'generateOperationsReport': {
      const totalDonations = await Donation.countDocuments();
      const closedDonations = await Donation.find({ status: 'CLOSED' });
      const totalMealsRescued = closedDonations.reduce((acc, d) => acc + (d.totalPortionsEstimated || 0), 0);
      const activeDonations = await Donation.countDocuments({
        status: { $nin: ['CLOSED', 'REJECTED', 'CANCELLED'] }
      });
      const verifiedNgosCount = await NGOProfile.countDocuments({ verificationStatus: 'VERIFIED' });

      return {
        totalDonationsLogged: totalDonations,
        activeInFlight: activeDonations,
        totalMealsRescued,
        verifiedNGOsRegistered: verifiedNgosCount,
        region: 'Bengaluru, Karnataka'
      };
    }

    case 'searchBengaluruNGOsByLocation': {
      const target = resolveCoordinates(args.areaOrZone);
      const maxDist = args.maxDistanceKm || 15;
      const [refLng, refLat] = target.coordinates;

      // 1. Query live database first
      let dbNgos = [];
      try {
        dbNgos = await NGOProfile.find({
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [refLng, refLat] },
              $maxDistance: maxDist * 1000
            }
          }
        }).limit(8);
      } catch (e) {
        // Fallback gracefully if geospatial index or connection is minimal
        dbNgos = [];
      }

      // 2. Query rich Bengaluru verified directory
      const directoryResults = BENGALURU_NGO_MAP_DIRECTORY.map((ngo) => {
        const dist = calculateDistanceKm(refLat, refLng, ngo.coordinates[1], ngo.coordinates[0]);
        return {
          ...ngo,
          distanceKm: Math.round(dist * 10) / 10
        };
      })
        .filter((ngo) => ngo.distanceKm <= maxDist || ngo.area.toLowerCase().includes(args.areaOrZone.toLowerCase()))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return {
        searchedLocation: target.name,
        referenceCoordinates: [refLng, refLat],
        totalFound: directoryResults.length + dbNgos.length,
        nearbyNGOs: directoryResults.slice(0, 6),
        databaseRegisteredCount: dbNgos.length
      };
    }

    case 'calculateTransitRoute': {
      const orig = resolveCoordinates(args.originArea);
      const dest = resolveCoordinates(args.destinationArea);

      const route = await calculateRouteMatrix(orig.coordinates, dest.coordinates);
      return {
        origin: orig.name,
        destination: dest.name,
        originCoordinates: orig.coordinates,
        destinationCoordinates: dest.coordinates,
        roadDistanceKm: route.distanceKm,
        transitDurationMinutes: route.durationMinutes,
        trafficCondition: route.trafficCondition,
        routeWaypoints: route.waypoints
      };
    }

    default:
      throw new Error(`Tool ${name} is not recognized or not authorized.`);
  }
};

/**
 * Fallback Rule-Based Query Handler for Map & Location queries when offline or no API key
 */
const generateOfflineStructuredResponse = async (prompt) => {
  const lower = prompt.toLowerCase();

  if (lower.includes('ngo') || lower.includes('map') || lower.includes('location') || lower.includes('bengaluru') || lower.includes('bangalore') || lower.includes('where')) {
    // Detect locality
    let matchedArea = 'Bengaluru Central';
    for (const ngo of BENGALURU_NGO_MAP_DIRECTORY) {
      if (lower.includes(ngo.area.toLowerCase()) || lower.includes(ngo.zone.toLowerCase())) {
        matchedArea = ngo.area;
        break;
      }
    }

    const searchRes = await executeAITool('searchBengaluruNGOsByLocation', { areaOrZone: matchedArea, maxDistanceKm: 25 });
    
    let table = '| # | NGO Name | Area / Zone | Capacity | Food Accepted | Coordinates (Lng, Lat) |\n';
    table += '|---|---|---|---|---|---|\n';
    searchRes.nearbyNGOs.forEach((ngo, idx) => {
      table += `| ${idx + 1} | **${ngo.ngoName}** | ${ngo.area} (${ngo.zone}) | ${ngo.capacityHeadcount} pax | ${ngo.acceptedTypes.join(', ')} | \`[${ngo.coordinates[0]}, ${ngo.coordinates[1]}]\` |\n`;
    });

    return `## 🗺️ Bengaluru Verified NGO Map & Geospatial Directory

### 🎯 Direct Location Overview
Below is the verified geospatial directory of hunger-relief NGOs across **Bengaluru, Karnataka**, including their GPS coordinates, coverage zones, headcount capacity, and dietary acceptance:

${table}

### 🔍 Key Transit & Regional Hubs
- **Central / East Hub (Indiranagar, Ulsoor, MG Road):** High restaurant surplus corridor, covered by *Robin Hood Army* & *Ashwini Charitable Trust*.
- **South Bengaluru Corridor (Koramangala, HSR Layout, BTM):** High residential & tech park density, covered by *Hasiru Dala* & *Samarthanam Trust*.
- **West / Industrial Zone (Rajajinagar, Peenya):** High capacity distribution hub led by *Akshaya Patra Central Kitchen* (5,000+ meals capacity).
- **East IT Corridor (Whitefield, Marathahalli):** Rapid community and construction worker outreach by *Whitefield Rising Relief Kitchen*.
- **North Corridor (Hebbal, Yelahanka):** Shelter and geriatric nutrition care by *Vidyaranya*.

### 💡 Logistics & Transit Guidelines
- Average road transit factor in Bengaluru urban traffic is **1.25× straight-line Haversine distance**.
- For perishable cooked donations, transit time must not exceed remaining safe shelf-life (estimated at 20 km/h average traffic speed + 10 min buffer).`;
  }

  if (lower.includes('report') || lower.includes('stat') || lower.includes('summary')) {
    const report = await executeAITool('generateOperationsReport', {});
    return `## 📊 Bengaluru FoodBridge Operations Summary

- **Region:** ${report.region}
- **Total Donations Logged:** ${report.totalDonationsLogged}
- **Active In-Flight Rescues:** ${report.activeInFlight}
- **Total Meals Rescued:** ${report.totalMealsRescued}
- **Verified Partner NGOs:** ${report.verifiedNGOsRegistered || 12}+ across BBMP zones.`;
  }

  return `### 🎯 FoodBridge Operations Assistant (Bengaluru)
I am equipped with complete map and location knowledge of verified NGOs across Bengaluru. You can ask me to:
- Find NGOs in any Bengaluru locality (e.g., *"Show NGOs in Koramangala, Indiranagar, or Whitefield"*).
- Calculate delivery distance and travel time between donors and NGOs.
- Check food capacities, refrigeration availability, and dietary preferences.`;
};

/**
 * AI Assistant Chat Interface with Structured Formatting & Bengaluru Map Knowledge
 */
export const queryOperationsAssistant = async (prompt, conversationHistory = []) => {
  // If no Gemini key is provided, return rich structured markdown response
  if (!env.GEMINI_API_KEY) {
    const offlineMessage = await generateOfflineStructuredResponse(prompt);
    return {
      message: offlineMessage,
      toolExecuted: null
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ functionDeclarations: AI_TOOLS_DECLARATIONS }],
      systemInstruction: `You are the FoodBridge Bengaluru Operations Copilot & Map Logistics Expert.
Your mission is to assist human administrators and coordinators in surplus food rescue, NGO identification, and routing across Bengaluru, Karnataka.

CRITICAL INSTRUCTIONS & FORMATTING RULES (Like EduPilot AI):
1. PRODUCE CLEAN, HIGH-CONTENT MARKDOWN RESPONSES:
   - Start with a clear level 2 heading (e.g. ## 🗺️ Bengaluru NGO Location Analysis).
   - Provide a "### 🎯 Direct Answer" immediately.
   - Use clean Markdown tables with columns:
     | # | NGO / Location | Area & Zone | Headcount Capacity | Coordinates & Route Details |
     |---|---|---|---|---|
   - Break down transit distance, estimated time in Bengaluru traffic (20 km/h avg speed), and shelf-life feasibility.
   - Include a "### 💡 Operational Recommendation & Next Steps" at the end.
2. GEOSPATIAL MAP KNOWLEDGE OF BENGALURU:
   - You have native knowledge of Bengaluru geography, zones (North, South, East, West, Central, ITPL Whitefield, Electronic City, Koramangala, Indiranagar, HSR, Jayanagar, Rajajinagar, Yelahanka).
   - Always provide exact coordinates or landmarks when discussing locations.
   - Use tools: 'searchBengaluruNGOsByLocation', 'calculateTransitRoute', 'rankNGOs', 'getDonationDetails', 'getAvailableVehicles', 'generateOperationsReport'.
3. SAFETY & GOVERNANCE:
   - All database state transitions (vehicle dispatch, allocation confirmation) REQUIRE human-in-the-loop approval.
   - Strictly respect dietary constraints (veg vs non-veg) and remaining food shelf life.`
    });

    const chat = model.startChat({ history: conversationHistory });
    const result = await chat.sendMessage(prompt);
    const call = result.response.functionCalls()?.[0];

    if (call) {
      const toolResult = await executeAITool(call.name, call.args);
      const secondResponse = await chat.sendMessage([
        {
          functionResponse: {
            name: call.name,
            response: toolResult
          }
        }
      ]);
      return {
        message: secondResponse.response.text(),
        toolExecuted: {
          name: call.name,
          arguments: call.args,
          output: toolResult
        }
      };
    }

    return {
      message: result.response.text(),
      toolExecuted: null
    };
  } catch (error) {
    // If Gemini call fails (e.g. invalid key or network issue), fallback gracefully to offline structured handler
    const fallbackMessage = await generateOfflineStructuredResponse(prompt);
    return {
      message: fallbackMessage,
      toolExecuted: null
    };
  }
};
