import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, CircularProgress } from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import axios from 'axios';
import { API_URL } from '../../../config/enviroment';
import api from '../../../config/api.js';
import { pink } from '@mui/material/colors';

const CumpleanerosWidget = () => {
  const [cumpleaneros, setCumpleaneros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCumpleaneros = async () => {
      try {
        const response = await api.get('/cumpleaneros');
        setCumpleaneros(response.data.data || []);
      } catch (error) {
        console.error("Error obteniendo cumpleañeros", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCumpleaneros();
  }, []);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const currentMonth = monthNames[new Date().getMonth()];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${pink[100]}`,
        borderTop: `4px solid ${pink[500]}`,
        backgroundColor: "background.paper",
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: "50%", bgcolor: pink[50], mr: 2 }}>
          <CakeIcon sx={{ fontSize: 28, color: pink[600] }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          Cumpleañeros de {currentMonth}
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}><CircularProgress size={30} /></Box>
      ) : cumpleaneros.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0, overflowY: 'auto', flex: 1, pr: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: pink[200], borderRadius: '10px' } }}>
          {cumpleaneros.map((cumple, i) => {
            // Extraer el día directamente del string (YYYY-MM-DD) para evitar problemas de zona horaria
            const diaV = parseInt(cumple.fechaNacimiento.split('-')[2].substring(0, 2), 10);
            return (
              <React.Fragment key={i}>
                <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: pink[300] }}>
                       {cumple.primerNombre.charAt(0)}{cumple.primerApellido.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${cumple.primerNombre} ${cumple.primerApellido}`}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                    secondary={`🎉 El ${diaV} de este mes`}
                    secondaryTypographyProps={{ fontSize: '0.8rem', color: pink[800] }}
                  />
                </ListItem>
                {i < cumpleaneros.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, textAlign: 'center', mt: 2 }}>
          No hay cumpleañeros este mes.
        </Typography>
      )}
    </Paper>
  );
};

export default CumpleanerosWidget;
