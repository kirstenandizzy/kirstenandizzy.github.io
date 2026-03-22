const ENDPOINT = import.meta.env.VITE_RSVP_ENDPOINT;

export default async function submitRSVP(formData) {
  if (!ENDPOINT) {
    throw new Error('RSVP endpoint not configured — set VITE_RSVP_ENDPOINT in .env');
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    throw new Error('Failed to submit RSVP');
  }

  return res.json();
}
