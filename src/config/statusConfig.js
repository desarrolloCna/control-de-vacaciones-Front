export const ESTADO_CONFIG = {
  enviada:        { label: "Pendiente",     color: "#ff9800", muiColor: "warning" },
  autorizadas:    { label: "Autorizada",    color: "#4caf50", muiColor: "success" },
  rechazada:      { label: "Rechazada",     color: "#f44336", muiColor: "error" },
  finalizadas:    { label: "Finalizada",    color: "#2196f3", muiColor: "info" },
  cancelada:      { label: "Reprogramada",  color: "#9c27b0", muiColor: "secondary" },
  reprogramacion: { label: "Reprogramada",  color: "#9c27b0", muiColor: "secondary" },
};

export const getEstado = (raw) => ESTADO_CONFIG[raw] || { label: raw, color: "#999", muiColor: "default" };
