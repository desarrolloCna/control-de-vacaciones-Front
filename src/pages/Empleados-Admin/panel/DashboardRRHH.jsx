import React, { useState, useEffect } from "react";
import { Container, Grid, Typography, Box, Card, CardContent } from "@mui/material";
import Navbar from "../../../components/navBar/NavBar";
import Spinner from "../../../components/spinners/spinner";
import api from "../../../config/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import BackButton from "../../../components/BackButton/BackButton";

export default function DashboardRRHH() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reportes/dashboard');
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("No se pudo cargar la información del dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Spinner />;

  // Map para gráfico de pie
  const pieData = dashboardData?.distribucionEstados ? Object.keys(dashboardData.distribucionEstados).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: dashboardData.distribucionEstados[key]
  })) : [];

  const COLORS = ['#FF9800', '#4CAF50', '#F44336', '#2196F3', '#9C27B0'];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BackButton />
          <Typography variant="h4" sx={{ fontWeight: "bold", ml: 2, color: "#1a1a2e" }}>
            Dashboard General de RRHH
          </Typography>
        </Box>

        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={3}>
            {/* KPI Cards */}
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography color="text.secondary" gutterBottom>Total Solicitudes Mensuales</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: "#f5a623" }}>
                    {dashboardData?.kpis?.totalMes || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography color="text.secondary" gutterBottom>Tasa de Aprobación</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: "#4caf50" }}>
                    {dashboardData?.kpis?.tasaAprobacion || "0"}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography color="text.secondary" gutterBottom>Promedio Días por Solicitud</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: "#2196f3" }}>
                    {dashboardData?.kpis?.promedioDias || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Gráfico */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: "#1a1a2e" }}>Distribución de Estados</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
