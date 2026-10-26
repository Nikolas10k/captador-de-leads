import "server-only";
import { normalizePhoneBR } from "@/lib/format";

// Places API (New) · Text Search
// https://developers.google.com/maps/documentation/places/web-service/text-search
// Os campos websiteUri/telefone/nota entram no SKU "Text Search Enterprise":
// cada página (até 20 resultados) conta como 1 requisição.

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.shortFormattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.businessStatus",
  "places.primaryTypeDisplayName",
  "nextPageToken",
].join(",");

// Retângulo aproximado do DF + entorno próximo, para priorizar resultados daqui
const DF_BIAS = {
  rectangle: {
    low: { latitude: -16.1, longitude: -48.35 },
    high: { latitude: -15.45, longitude: -47.25 },
  },
};

type RawPlace = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  businessStatus?: string;
  primaryTypeDisplayName?: { text: string };
};

export type Place = {
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  /** celular (9 dígitos após o DDD): provavelmente tem WhatsApp */
  isMobile: boolean;
  website: string | null;
  rating: number | null;
  reviews: number;
  mapsUrl: string | null;
  category: string | null;
};

export function placesConfigured() {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY);
}

export class PlacesError extends Error {}

export async function searchPlaces(textQuery: string, pageToken?: string) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new PlacesError("A busca no Google Maps ainda não foi configurada (GOOGLE_PLACES_API_KEY).");

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "pt-BR",
      regionCode: "BR",
      pageSize: 20,
      locationBias: DF_BIAS,
      ...(pageToken ? { pageToken } : {}),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[places]", res.status, body.slice(0, 500));
    if (res.status === 403) throw new PlacesError("O Google recusou a chave da API. Confira se a Places API (New) está ativada e o faturamento configurado.");
    if (res.status === 429) throw new PlacesError("Limite de buscas do Google atingido por agora. Tente de novo em alguns minutos.");
    throw new PlacesError("O Google Maps não respondeu agora. Tente de novo em instantes.");
  }

  const json = (await res.json()) as { places?: RawPlace[]; nextPageToken?: string };
  const places = (json.places ?? [])
    .filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY")
    .map<Place>((p) => {
      const phone = p.nationalPhoneNumber ? normalizePhoneBR(p.nationalPhoneNumber) : null;
      return {
        placeId: p.id,
        name: p.displayName?.text ?? "Sem nome",
        address: p.shortFormattedAddress ?? p.formattedAddress ?? null,
        phone: phone && /^\d{10,11}$/.test(phone) ? phone : null,
        isMobile: !!phone && /^\d{2}9\d{8}$/.test(phone),
        website: p.websiteUri ?? null,
        rating: p.rating ?? null,
        reviews: p.userRatingCount ?? 0,
        mapsUrl: p.googleMapsUri ?? null,
        category: p.primaryTypeDisplayName?.text ?? null,
      };
    });

  return { places, nextPageToken: json.nextPageToken ?? null };
}

/** Sites que não são site próprio (o negócio continua sendo um bom prospect) */
const NOT_A_REAL_SITE = /(instagram\.com|facebook\.com|wa\.me|whatsapp\.com|linktr\.ee|ifood\.com|linktree|beacons\.ai|bio\.link)/i;

export function hasOwnWebsite(place: Place) {
  return !!place.website && !NOT_A_REAL_SITE.test(place.website);
}
