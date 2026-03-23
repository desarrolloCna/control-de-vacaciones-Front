import React from 'react';
import { Box, Paper, Typography, Grid, styled, Avatar, Divider } from '@mui/material';

const DetailText = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mt: 0.5 }}>
      {value || "No registrado"}
    </Typography>
  </Box>
);

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  color: '#1A237E',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  '&:before': {
    content: '""',
    display: 'block',
    width: 4,
    height: 24,
    backgroundColor: '#3f51b5',
    marginRight: theme.spacing(2),
    borderRadius: 2,
  }
}));

const GeneralInformation = ({ infoPersonal, infoDpi }) => {
  const p = infoPersonal || {};
  // El CUI viene del hook de DPI, buscamos en varias ubicaciones
  const cuiValue = 
    infoDpi?.numeroDocumento || 
    infoDpi?.responseData?.numeroDocumento || 
    infoDpi?.cui || 
    infoDpi?.responseData?.cui ||
    p.cui;
    
  // El IGSS se llama numAfiliacionIgss en la base de datos
  const igssValue = p.numAfiliacionIgss || p.numAfiliacionIgss || p.numeroIgss;

  return (
    <Paper 
      elevation={4} 
      sx={{ 
        p: 4, 
        borderRadius: 5, 
        bgcolor: 'white',
        border: '1px solid #edf2f7',
        height: '100%'
      }}
    >
      <SectionTitle variant="h6">
        Información Personal Principal
      </SectionTitle>

      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <DetailText label="Primer Nombre" value={p.primerNombre} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DetailText label="Segundo Nombre" value={p.segundoNombre} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DetailText label="Tercer Nombre" value={p.tercerNombre} />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <DetailText label="Primer Apellido" value={p.primerApellido} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DetailText label="Segundo Apellido" value={p.segundoApellido} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DetailText label="Apellido de Casada" value={p.apellidoCasada} />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2, opacity: 0.5 }} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <DetailText label="DPI / CUI" value={cuiValue} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DetailText label="NIT" value={p.nit} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DetailText label="Número de IGSS" value={igssValue} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default GeneralInformation;
