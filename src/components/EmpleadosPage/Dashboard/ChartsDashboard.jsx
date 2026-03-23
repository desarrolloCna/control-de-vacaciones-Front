import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useGetDiasSolicitados } from '../../../hooks/VacationAppHooks/useGetDiasSolicitados';
import { useSolicitudById } from '../../../hooks/VacationAppHooks/useSolicitudById';

const ChartsDashboard = () => {
  const theme = useTheme();
  
  // Custom hooks de datos
  const { diasDisponiblesT, diasDebitados, loadingD } = useGetDiasSolicitados();
  const { solicitudesEmpleado, loadingS } = useSolicitudById();

  const isDark = theme.palette.mode === 'dark';

  // --------- Datos para Gráfico de Días (Pie) ---------
  const pieData = useMemo(() => {
    const limite = diasDisponiblesT < 20 ? diasDisponiblesT : 20;
    const debitados = diasDebitados || 0;
    const disponibles = limite - debitados;
    
    return [
      { name: 'Días Disponibles', value: disponibles > 0 ? disponibles : 0 },
      { name: 'Días Usados', value: debitados }
    ];
  }, [diasDisponiblesT, diasDebitados]);

  // Colores fijos para la consistencia
  const PIE_COLORS = ['#4caf50', '#f44336']; // Verde y Rojo

  // --------- Datos para Gráfico de Solicitudes (Bar) ---------
  const barData = useMemo(() => {
    if (!solicitudesEmpleado || solicitudesEmpleado.length === 0) return [];
    
    // Contar estados
    const counts = {
      enviada: 0,
      autorizadas: 0,
      rechazada: 0,
      finalizadas: 0,
      cancelada: 0
    };

    solicitudesEmpleado.forEach(sol => {
      if (counts[sol.estadoSolicitud] !== undefined) {
        counts[sol.estadoSolicitud]++;
      }
    });

    return [
      { name: 'Enviadas', Cantidad: counts.enviada, fill: '#ff9800' },
      { name: 'Aprobadas', Cantidad: counts.autorizadas, fill: '#4caf50' },
      { name: 'Rechazadas', Cantidad: counts.rechazada, fill: '#f44336' },
      { name: 'Finalizadas', Cantidad: counts.finalizadas, fill: '#9c27b0' },
    ];
  }, [solicitudesEmpleado]);

  if (loadingD || loadingS) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Estilos de texto adaptativos
  const textColor = theme.palette.text.primary;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Gráfico 1: Uso de Días */}
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ 
          p: 3, 
          height: '100%',
          borderTop: `4px solid ${PIE_COLORS[0]}`, 
          border: `1px solid ${theme.palette.divider}` 
        }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
            Balance de Días Anuales
          </Typography>
          <Box sx={{ height: 250, width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: theme.palette.background.paper, color: textColor }} 
                  itemStyle={{ color: textColor }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Gráfico 2: Resumen de Solicitudes */}
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ 
          p: 3, 
          height: '100%', 
          borderTop: `4px solid ${theme.palette.primary.main}`,
          border: `1px solid ${theme.palette.divider}` 
        }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
            Estados de Solicitudes Mías
          </Typography>
          {barData.length > 0 ? (
            <Box sx={{ height: 250, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" stroke={textColor} />
                  <YAxis allowDecimals={false} stroke={textColor} />
                  <Tooltip 
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                    contentStyle={{ backgroundColor: theme.palette.background.paper, color: textColor }}
                  />
                  <Bar dataKey="Cantidad" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Aún no tienes solicitudes registradas.</Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ChartsDashboard;
