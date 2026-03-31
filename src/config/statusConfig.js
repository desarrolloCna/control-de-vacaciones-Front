export const ESTADO_CONFIG = {
  enviada:        { label: "Pendiente",     color: "#F59E0B", textColor: "#ffffff", muiColor: "warning" },
  autorizadas:    { label: "Autorizada",    color: "#10B981", textColor: "#ffffff", muiColor: "success" },
  rechazada:      { label: "Rechazada",     color: "#EF4444", textColor: "#ffffff", muiColor: "error" },
  finalizadas:    { label: "Finalizada",    color: "#334155", textColor: "#ffffff", muiColor: "info" },
  cancelada:      { label: "Cancelada",     color: "#ef4444", textColor: "#ffffff", muiColor: "error" },
  reprogramada:   { label: "Reprogramada",  color: "#8B5CF6", textColor: "#ffffff", muiColor: "secondary" },
  reprogramadas:  { label: "Reprogramada",  color: "#8B5CF6", textColor: "#ffffff", muiColor: "secondary" },
  reprogramacion: { label: "Reprogramada",  color: "#8B5CF6", textColor: "#ffffff", muiColor: "secondary" },
};

export const getEstado = (raw) => ESTADO_CONFIG[raw] || { label: raw, color: "#94a3b8", textColor: "#ffffff", muiColor: "default" };
