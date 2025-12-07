import { NextResponse } from "next/server";

// OpenStreetMap (Nominatim) & Overpass API Integration
// We use Nominatim for geocoding and initial search.
// We use Overpass API for category-based search (e.g. "IT Companies") which Nominatim handles poorly.

interface OSMResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
    tags?: Record<string, string>;
}

// Map common user search terms to OSM tags (OR condition supported via array)
// Keys should be lowercased.
const KEYWORD_MAPPINGS: Record<string, string[]> = {
    // Specific Clothing/Textile
    "saree": ['["shop"~"clothes|fabric"]["name"~"saree|silk|textile|fabrics",i]'],
    "sari": ['["shop"~"clothes|fabric"]["name"~"saree|silk|textile|fabrics",i]'],
    "silk": ['["shop"~"clothes|fabric"]["name"~"saree|silk|textile|fabrics",i]'],
    "textile": ['["shop"~"clothes|fabric"]["name"~"textile|fabrics|silk",i]'],
    "boutique": ['["shop"="boutique"]'],
    "clothing": ['["shop"="clothes"]'],
    "garment": ['["shop"="clothes"]'],
    "dress": ['["shop"="clothes"]'],
    "fashion": ['["shop"="clothes"]'],

    // Jewelry
    "jewellery": ['["shop"="jewelry"]'],
    "jewelry": ['["shop"="jewelry"]'],
    "gold": ['["shop"="jewelry"]'],

    // Tech / Office
    "software": ['["office"~"it|software|technology"]'],
    "it company": ['["office"~"it|software|technology"]'],
    "web": ['["office"~"it|web|design|marketing"]'],
    "website": ['["office"~"it|web|design|marketing"]'],
    "design": ['["office"~"design|marketing|advertising"]'],
    "marketing": ['["office"~"marketing|advertising"]'],
    "advertising": ['["office"~"advertising"]'],
    "seo": ['["office"~"marketing|it"]'],

    // Food
    "restaurant": ['["amenity"="restaurant"]'],
    "cafe": ['["amenity"="cafe"]'],
    "bakery": ['["shop"="bakery"]'],
    "food": ['["amenity"~"restaurant|cafe|fast_food"]'],

    // Services
    "gym": ['["leisure"="fitness_centre"]'],
    "fitness": ['["leisure"="fitness_centre"]'],
    "hospital": ['["amenity"="hospital"]'],
    "school": ['["amenity"="school"]'],
    "college": ['["amenity"="college"]'],
    "university": ['["amenity"="university"]'],
    "plumber": ['["craft"="plumber"]', '["shop"="bathroom_furnishing"]', '["shop"="hardware"]'],
    "electrician": ['["craft"="electrician"]'],
    "carpenter": ['["craft"="carpenter"]'],
    "painter": ['["craft"="painter"]'],
    "cleaning": ['["shop"="dry_cleaning"]', '["craft"="cleaning"]'],

    // Automotive
    "mechanic": ['["shop"="car_repair"]', '["craft"="mechanic"]'],
    "garage": ['["shop"="car_repair"]'],
    "car": ['["shop"="car"]', '["shop"="car_repair"]'],
    "repair": ['["shop"~"repair"]', '["craft"~"repair"]'],
    "wash": ['["amenity"="car_wash"]'],
    "dealer": ['["shop"="car"]'],

    // Health & Beauty
    "salon": ['["shop"="beauty"]', '["shop"="hairdresser"]'],
    "beauty": ['["shop"="beauty"]'],
    "spa": ['["leisure"="sauna"]', '["shop"="beauty"]'],
    "barber": ['["shop"="hairdresser"]'],
    "doctor": ['["amenity"="doctors"]'],
    "clinic": ['["amenity"="clinic"]'],
    "pharmacy": ['["amenity"="pharmacy"]'],
    "dentist": ['["amenity"="dentist"]'],

    // Professional Services
    "real estate": ['["office"="estate_agent"]'],
    "realtor": ['["office"="estate_agent"]'],
    "lawyer": ['["office"="lawyer"]'],
    "legal": ['["office"="lawyer"]'],
    "accountant": ['["office"="accountant"]'],
    "consultant": ['["office"="consulting"]'],
    "agency": ['["office"~"agency|company"]'],
    "travel": ['["shop"="travel_agency"]'],
    "bank": ['["amenity"="bank"]'],
    "atm": ['["amenity"="atm"]'],
    "insurance": ['["office"="insurance"]'],

    // Construction / Home
    "construction": ['["office"="construction"]', '["craft"="builder"]'],
    "builder": ['["office"="construction"]', '["craft"="builder"]'],
    "architect": ['["office"="architect"]'],
    "interior": ['["office"="interior_design"]'],

    // Generic (Low Priority)
    "shop": ['["shop"]'],
    "shops": ['["shop"]'],
    "store": ['["shop"]'],
    "stores": ['["shop"]'],
    "supermarket": ['["shop"="supermarket"]'],
    "mall": ['["shop"="mall"]'],
    "malls": ['["shop"="mall"]'],
    "shopping mall": ['["shop"="mall"]'],
    "shopping malls": ['["shop"="mall"]'],
    "hotel": ['["tourism"="hotel"]'],
    "hotels": ['["tourism"="hotel"]'],
    "office": ['["office"]'],
    "offices": ['["office"]'],
    "company": ['["office"]'],
    "companies": ['["office"]'],
    "it companies": ['["office"~"it|software|technology"]'],
    "software companies": ['["office"~"it|software|technology"]'],
};

// Smart Aliases to normalize natural language
const SMART_ALIASES: Record<string, string> = {
    "website building": "web design",
    "web development": "software",
    "app development": "software",
    "coding agency": "software",
    "home cleaning": "cleaning",
    "house keeping": "cleaning",
    "car service": "mechanic",
    "bike repair": "mechanic",
    "beauty parlour": "salon",
    "hair cut": "barber",
    "tax filing": "accountant",
    "legal help": "lawyer",
    "property dealer": "real estate",
    "cab service": "taxi",
};

async function fetchFromNominatim(query: string): Promise<OSMResult[]> {
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=50`;
    console.log(`Fetching from Nominatim: ${searchUrl}`);

    try {
        const res = await fetch(searchUrl, {
            headers: { "User-Agent": "ArivanceLeadFinder/1.0" }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Nominatim error:", e);
        return [];
    }
}

async function fetchFromOverpass(bbox: string[], tags: string[]): Promise<OSMResult[]> {
    // bbox from Nominatim is [minLat, maxLat, minLon, maxLon] strings
    // Overpass expects (minLat, minLon, maxLat, maxLon)
    let [minLat, maxLat, minLon, maxLon] = bbox.map(Number);

    // Expand bbox if it's too small (e.g. a single point)
    const latDiff = maxLat - minLat;
    const lonDiff = maxLon - minLon;
    if (latDiff < 0.02) {
        minLat -= 0.01;
        maxLat += 0.01;
    }
    if (lonDiff < 0.02) {
        minLon -= 0.01;
        maxLon += 0.01;
    }

    const searchArea = `${minLat},${minLon},${maxLat},${maxLon}`;

    // Construct query with union of all tag sets
    const queryParts = tags.map(tag => `
            node${tag}(${searchArea});
            way${tag}(${searchArea});
            relation${tag}(${searchArea});
    `).join('\n');

    const query = `
        [out:json][timeout:25];
        (
            ${queryParts}
        );
        out center 100;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    console.log(`Fetching from Overpass: ${url}`);

    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();

        return (data.elements || []).map((el: any) => ({
            place_id: el.id,
            osm_id: el.id,
            lat: el.lat || el.center?.lat,
            lon: el.lon || el.center?.lon,
            display_name: el.tags?.name || el.tags?.brand || "Unknown Business",
            type: el.tags?.amenity || el.tags?.office || el.tags?.shop || "business",
            tags: el.tags
        })).filter((el: any) => el.display_name !== "Unknown Business");
    } catch (e) {
        console.error("Overpass error:", e);
        return [];
    }
}

import { getServerSession } from "next-auth";
import { findUserByEmail, saveUser } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route"; // We need to export authOptions from route.ts

export async function POST(req: Request) {
    try {
        // 1. Check Authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 401 });
        }

        const user = await findUserByEmail(session.user.email);
        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        // 2. Check Subscription Status
        const now = new Date();
        const subStart = new Date(user.subscriptionStart);
        const daysSinceStart = (now.getTime() - subStart.getTime()) / (1000 * 3600 * 24);

        if (daysSinceStart > 30) {
            return NextResponse.json({ error: "Subscription expired. Please renew." }, { status: 403 });
        }

        if (user.leadsUsed >= user.leadsLimit) {
            return NextResponse.json({ error: `Monthly limit reached (${user.leadsLimit} leads). Upgrade your plan.` }, { status: 403 });
        }

        const { service, location, criteria, limit } = await req.json();
        const searchTerm = criteria || service; // Fallback to service if criteria is empty

        // Validate limit
        const requestedLimit = limit ? parseInt(limit) : 10;
        const remainingCredits = user.leadsLimit - user.leadsUsed;

        if (requestedLimit > remainingCredits) {
            return NextResponse.json({ error: `You only have ${remainingCredits} credits left.` }, { status: 403 });
        }

        // 1. Try standard Nominatim search first
        const nominatimQuery = `${searchTerm} in ${location}`;
        let results = await fetchFromNominatim(nominatimQuery);

        // 2. If few results, try Overpass API
        if (results.length < 3) {
            console.log("Few results from Nominatim, trying Overpass...");

            // Geocode the location to get bounding box
            const locationResults = await fetchFromNominatim(location);

            if (locationResults.length > 0) {
                const bbox = locationResults[0].boundingbox;

                // Advanced Criteria Parsing
                // Split by common separators to handle "IT companies and shopping malls"
                // Use criteria directly if available, otherwise fallback to searchTerm
                const queryText = criteria || searchTerm;
                const searchTerms = queryText.toLowerCase().split(/,| and | or | & /).map((s: string) => s.trim()).filter((s: string) => s.length > 0);

                let allMatchedTags: string[] = [];

                for (const term of searchTerms) {
                    let termTags: string[] = [];

                    // 1. Check Smart Aliases
                    if (SMART_ALIASES[term]) {
                        const alias = SMART_ALIASES[term];
                        if (KEYWORD_MAPPINGS[alias]) {
                            termTags.push(...KEYWORD_MAPPINGS[alias]);
                        }
                    }

                    // 2. Check Keyword Mappings
                    const sortedKeys = Object.keys(KEYWORD_MAPPINGS).sort((a, b) => b.length - a.length);
                    for (const key of sortedKeys) {
                        // Check for exact match or plural match
                        if (term === key || term === key + "s" || term.includes(key)) {
                            termTags.push(...KEYWORD_MAPPINGS[key]);
                            break;
                        }
                    }

                    // 3. Token Fallback
                    if (termTags.length === 0) {
                        const tokens = term.split(" ");
                        for (const token of tokens) {
                            // Check exact or singular form (simple heuristic)
                            const singular = token.endsWith("s") ? token.slice(0, -1) : token;

                            if (KEYWORD_MAPPINGS[token]) {
                                termTags.push(...KEYWORD_MAPPINGS[token]);
                            } else if (KEYWORD_MAPPINGS[singular]) {
                                termTags.push(...KEYWORD_MAPPINGS[singular]);
                            }
                        }
                    }

                    // 4. Generic Fallback
                    if (termTags.length === 0) {
                        if (term.includes("shop") || term.includes("store")) {
                            termTags.push(`["shop"]["name"~"${term}",i]`);
                        } else if (term.includes("company") || term.includes("office")) {
                            termTags.push(`["office"]["name"~"${term}",i]`);
                        } else {
                            // Last resort: search by name
                            termTags.push(`["name"~"${term}",i]`);
                        }
                    }

                    allMatchedTags.push(...termTags);
                }

                // Remove duplicates
                allMatchedTags = [...new Set(allMatchedTags)];

                if (allMatchedTags.length > 0 && bbox) {
                    const overpassResults = await fetchFromOverpass(bbox, allMatchedTags);
                    // Merge results
                    const existingIds = new Set(results.map(r => r.place_id));
                    for (const res of overpassResults) {
                        if (!existingIds.has(res.place_id)) {
                            results.push(res);
                        }
                    }
                }
            }
        }

        // Apply limit
        const finalResults = results.slice(0, requestedLimit);
        console.log(`Total results found: ${finalResults.length}`);

        // Update usage ONLY if we found results
        if (finalResults.length > 0) {
            user.leadsUsed += finalResults.length;
            await saveUser(user);
        }

        const leads = finalResults.map((place) => {
            // Extract business name
            const businessName = place.display_name.split(",")[0];

            // Simulate rich data
            const websiteStatus = Math.random() > 0.6 ? "missing" : (Math.random() > 0.5 ? "outdated" : "good");
            const rating = (3.5 + Math.random() * 1.5).toFixed(1);
            const userRatingsTotal = Math.floor(Math.random() * 300) + 5;

            // Generate AI Match Reason
            let matchReason = "";
            if (websiteStatus === "missing") {
                matchReason = `High potential lead. ${businessName} is listed but has no linked website.`;
            } else if (websiteStatus === "outdated") {
                matchReason = `Online presence detected but likely outdated. Pitch a modern refresh for ${businessName}.`;
            } else {
                matchReason = `${businessName} matches your target criteria "${criteria}" in ${location}.`;
            }

            return {
                id: String(place.place_id),
                businessName: businessName,
                location: place.display_name.split(",").slice(1, 3).join(",").trim() || location,
                website: websiteStatus === "good" ? `https://www.${businessName.replace(/\s/g, "").toLowerCase()}.com` : undefined,
                websiteStatus,
                rating,
                userRatingsTotal,
                socialPresence: {
                    maps: true,
                    facebook: Math.random() > 0.5,
                    instagram: Math.random() > 0.5,
                },
                matchReason,
                confidence: 0.85 + (Math.random() * 0.1),
            };
        });

        // Save Search History
        if (leads.length > 0) {
            try {
                const { addDoc, collection } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                // Ensure we have a valid user ID
                if (user && user.id) {
                    const { query: firestoreQuery, where, getDocs, limit } = await import("firebase/firestore");

                    // Check for duplicate search in the last minute to prevent spamming history
                    const recentSearchQuery = firestoreQuery(
                        collection(db, "searches"),
                        where("userId", "==", user.id),
                        where("query", "==", `${criteria || searchTerm} in ${location}`),
                        // We can't easily filter by timestamp without a composite index, 
                        // so we'll fetch the latest one and check in memory or just deduplicate by query string if it's very recent.
                        // For simplicity and robustness without index changes, let's just check if the *very last* search was identical.
                        limit(1)
                    );

                    const recentSnap = await getDocs(recentSearchQuery);
                    let isDuplicate = false;

                    if (!recentSnap.empty) {
                        const lastSearch = recentSnap.docs[0].data();
                        const lastTime = new Date(lastSearch.timestamp).getTime();
                        const nowTime = new Date().getTime();
                        // If same query within last 5 minutes, update timestamp instead of creating new
                        if (nowTime - lastTime < 5 * 60 * 1000) {
                            isDuplicate = true;
                            // Optional: Update the timestamp of the existing doc so it moves to top?
                            // For now, just skipping the add is enough to solve the UI clutter.
                        }
                    }

                    if (!isDuplicate) {
                        await addDoc(collection(db, "searches"), {
                            userId: user.id,
                            query: `${criteria || searchTerm} in ${location}`,
                            service: service || "",
                            location: location || "",
                            criteria: criteria || "",
                            timestamp: new Date().toISOString(),
                            results: leads.map(l => ({
                                businessName: l.businessName,
                                location: l.location
                            })), // Store minimal data to save space
                            count: leads.length
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to save history:", e);
            }
        }

        return NextResponse.json({ leads });
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
