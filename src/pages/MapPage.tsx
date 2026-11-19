import { Plus, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IncidentDetails } from '../components/incidents/IncidentDetails';
import { IncidentForm } from '../components/incidents/IncidentForm';
import { CityMap } from '../components/map/CityMap';
import { useIncidents } from '../context/IncidentsContext';
import type { Incident, IncidentCategory, IncidentInput } from '../types';

export function MapPage() {
  const { incidents, create, loading, error, refresh, refreshing } = useIncidents();
  const [selected, setSelected] = useState<Incident | null>(null);
  const [placing, setPlacing] = useState<IncidentCategory | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const activeIncidents = useMemo(
    () => incidents.filter((incident) => incident.status !== 'CANCELLED'),
    [incidents],
  );

  useEffect(() => {
    const state = location.state as { incidentId?: string } | null;
    if (!state?.incidentId) return;
    const incident = incidents.find(item => item.id === state.incidentId);
    if (!incident) return;
    const timer = window.setTimeout(() => {
      setSelected(incident);
      setFocus({ lat: incident.latitude, lng: incident.longitude });
      navigate(location.pathname, { replace: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [incidents, location, navigate]);

  const onSelect = useCallback((incident: Incident) => {
    setSelected(incident);
    setPlacing(null);
  }, []);

  async function submit(input: IncidentInput) {
    const incident = await create(input);
    setSelected(incident);
    setPlacing(null);
    setCoords(null);
    setFocus({ lat: incident.latitude, lng: incident.longitude });
  }

  return <div className="map-page">
    <div className="map-stage">
      {loading && <div className="loading">Carregando mapa urbano...</div>}
      {error && <div className="error-banner"><span>{error}</span><button disabled={refreshing} onClick={()=>void refresh()}>{refreshing?'Tentando...':'Tentar novamente'}</button></div>}
      <CityMap incidents={activeIncidents} selectedId={selected?.id} placing={placing} onSelect={onSelect} onPlace={setCoords} onSetPlacing={(category)=>{setPlacing(category);setSelected(null);setCoords(null)}} focus={focus}/>
      {!placing && !selected && <div className="map-welcome"><span><Sparkles/> VISÃO COLABORATIVA</span><h1>Veja a cidade.<br/><em>Ajude a transformá-la.</em></h1><p>Explore ocorrências urbanas demonstrativas ou registre um novo ponto no mapa.</p></div>}
      {!placing && <button className="register" onClick={()=>{setPlacing('STREETLIGHT');setSelected(null);setCoords(null)}}><Plus/> Registrar ocorrência</button>}
      {placing && <IncidentForm category={placing} onCategoryChange={setPlacing} coords={coords} onCancel={()=>{setPlacing(null);setCoords(null)}} onSubmit={submit}/>}
    </div>
    {selected && <IncidentDetails incident={selected} onClose={()=>setSelected(null)} onMap={()=>setFocus({lat:selected.latitude,lng:selected.longitude})}/>}
  </div>;
}
