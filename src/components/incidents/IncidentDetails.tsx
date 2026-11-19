import {
  ChevronRight,
  Lightbulb,
  Map as MapIcon,
  MapPin,
  ShieldAlert,
  TriangleAlert,
  Waves,
  X,
} from 'lucide-react';
import { incidentCategoryLabels } from '../../types';
import type { Incident, IncidentCategory, IncidentStatus } from '../../types';

const categories: Record<IncidentCategory, { Icon: typeof Lightbulb }> = {
  STREETLIGHT: { Icon: Lightbulb },
  POTHOLE: { Icon: TriangleAlert },
  FLOOD: { Icon: Waves },
  SAFETY: { Icon: ShieldAlert },
};

const statusLabels: Record<IncidentStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em análise',
  RESOLVED: 'Resolvido',
  CANCELLED: 'Cancelada',
};

const statusSteps: IncidentStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];

function formatDateTime(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function IncidentDetails({
  incident,
  onClose,
  onMap,
}: {
  incident: Incident;
  onClose: () => void;
  onMap?: () => void;
}) {
  const { Icon: CategoryIcon } = categories[incident.category];
  const categoryLabel = incidentCategoryLabels[incident.category];
  const isCancelled = incident.status === 'CANCELLED';
  const currentStep = statusSteps.indexOf(incident.status);
  const inProgressAt = incident.history.find(
    (item) => item.newStatus === 'IN_PROGRESS',
  )?.changedAt;
  const resolvedAt = incident.history.find(
    (item) => item.newStatus === 'RESOLVED',
  )?.changedAt;

  const steps = isCancelled
    ? [
      { label: 'Ocorrência registrada', changedAt: incident.createdAt },
      {
        label: 'Cancelada',
        changedAt: incident.history.find(
          (item) => item.eventType === 'CANCELLED' || item.newStatus === 'CANCELLED',
        )?.changedAt,
      },
    ]
    : [
      { label: 'Ocorrência registrada', changedAt: incident.createdAt },
      { label: 'Em análise', changedAt: inProgressAt },
      { label: 'Resolvido', changedAt: resolvedAt },
    ];

  return (
    <aside className="detail-panel">
      <div className={`detail-cover ${incident.photoUrl ? '' : 'detail-cover-empty'}`}>
        {incident.photoUrl ? (
          <img
            className="detail-cover-image"
            src={incident.photoUrl}
            alt={`Foto da ocorrência: ${incident.title}`}
          />
        ) : (
          <div className="detail-cover-placeholder" aria-label="Ocorrência sem foto">
            <CategoryIcon aria-hidden="true" />
            <span>Foto não adicionada</span>
          </div>
        )}
        <button className="detail-close" onClick={onClose} aria-label="Fechar detalhes">
          <X />
        </button>
        <span className="detail-category-pill">
          <CategoryIcon aria-hidden="true" />
          {categoryLabel}
        </span>
      </div>

      <div className="detail-content">
        <h2 className="detail-title">{incident.title}</h2>
        <p className="detail-description">{incident.description}</p>

        <div className="detail-location">
          <MapPin aria-hidden="true" />
          <span>
            {incident.address ||
              `Coordenadas: ${incident.latitude.toFixed(5)}, ${incident.longitude.toFixed(5)}`}
          </span>
        </div>

        <dl className="detail-facts">
          <div className="detail-fact">
            <dt>Status</dt>
            <dd><span className={`detail-status status-${incident.status.toLowerCase()}`}>{statusLabels[incident.status]}</span></dd>
          </div>
          <div className="detail-fact">
            <dt>Data da ocorrência</dt>
            <dd>{formatDateTime(incident.createdAt)}</dd>
          </div>
          <div className="detail-fact">
            <dt>Categoria</dt>
            <dd className="detail-fact-category"><CategoryIcon aria-hidden="true" />{categoryLabel}</dd>
          </div>
        </dl>

        {onMap && (
          <button className="detail-map-button" onClick={onMap}>
            <MapIcon aria-hidden="true" />
            <span>Ver no mapa</span>
            <ChevronRight aria-hidden="true" />
          </button>
        )}

        <section className="detail-history" aria-labelledby="incident-history-title">
          <h3 id="incident-history-title">Histórico</h3>
          <div className="history-steps">
            {steps.map((step, index) => {
              const isComplete = isCancelled ? index === 0 : index < currentStep;
              const isCurrent = isCancelled ? index === 1 : index === currentStep;
              const changedAt = index === 0 ? incident.createdAt : step.changedAt;

              return (
                <div
                  className={`history-step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}
                  key={step.label}
                >
                  <i aria-hidden="true" />
                  <div>
                    <b>{step.label}</b>
                    <span>
                      {isCancelled || index <= currentStep ? formatDateTime(changedAt) : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}
