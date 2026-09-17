import { ArrowUpRight, MapPin, X } from 'lucide-react';
import { DATASET_URL, formatDate } from '@/data/dining';
import { formatDistance } from '@/data/nearby';

export default function Receipt({ location, landmark, saved, statusMessage, phase = 'visible', onTransitionEnd, onClose, onSave, onAddToItinerary }) {
  if (!location) return null;

  return (
    <aside className={`receipt is-${phase}`} onTransitionEnd={event=>{if(event.propertyName==='opacity')onTransitionEnd?.();}} aria-live="polite" aria-label={`Details for ${location.name}`}>
      <div className="receipt__topline">
        <span>Dining Out NYC</span>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close restaurant details">
          <X size={18} />
        </button>
      </div>
      <p className="receipt__eyebrow">Nearby dining ticket</p>
      <h3>{location.name}</h3>
      <p className="receipt__summary">{location.cuisine || 'Cuisine not matched'} · {formatDistance(location.distanceKm)} · {location.licenseType} Cafe</p>
      <div className="receipt__rule" />
      <dl>
        <div><dt>Area View</dt><dd>{landmark?.name || 'Selected landmark'}</dd></div>
        <div><dt>District</dt><dd>{landmark?.district} / {location.borough}</dd></div>
        <div><dt>Address</dt><dd>{location.address}</dd></div>
        <div><dt>Status</dt><dd><span className="status-dot" />{location.status}</dd></div>
        <div><dt>Issued</dt><dd>{formatDate(location.issuedAt)}</dd></div>
        <div><dt>Expires</dt><dd>{formatDate(location.expiresAt)}</dd></div>
      </dl>
      <div className="receipt__links">
        <a href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`} target="_blank" rel="noreferrer"><MapPin size={14}/> Open in Maps</a>
        <a href={DATASET_URL} target="_blank" rel="noreferrer">NYC Open Data <ArrowUpRight size={14}/></a>
      </div>
      <button type="button" className="receipt__save" aria-pressed={saved} onClick={onSave}>{saved ? 'Saved — remove' : 'Save restaurant'}</button>
      <div className="receipt__itinerary" aria-label="Add restaurant to your day">
        <span>Add to your day</span>
        {['morning','afternoon','evening'].map(slot=><button key={slot} type="button" onClick={()=>onAddToItinerary(slot,location)}>{slot}</button>)}
      </div>
      {statusMessage && <p className="receipt__feedback" aria-live="polite">{statusMessage}</p>}
      <p className="receipt__footer">Distance is straight-line. No price, hours or meal suitability is inferred.</p>
    </aside>
  );
}
