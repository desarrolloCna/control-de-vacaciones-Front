import React from "react";
import { Box, Skeleton, Grid, Card, CardContent } from "@mui/material";

/**
 * PageLoader — Loader de página completa con skeleton animado.
 * Úsalo cuando se carga la sesión o datos fundamentales de página.
 */
export const PageLoader = () => (
  <Box sx={{ minHeight: "100vh", bgcolor: "#f0f2f5", p: 4 }}>
    {/* Header skeleton */}
    <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
      <Skeleton variant="circular" width={48} height={48} animation="wave" />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="40%" height={36} animation="wave" />
        <Skeleton variant="text" width="25%" height={20} animation="wave" />
      </Box>
    </Box>

    {/* KPI cards skeleton */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} sm={4} key={i}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={20} animation="wave" />
              <Skeleton variant="text" width="40%" height={48} animation="wave" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* Table skeleton */}
    <Card sx={{ borderRadius: 3, p: 3 }}>
      <Skeleton variant="text" width="30%" height={28} animation="wave" sx={{ mb: 2 }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <Box key={i} sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
          <Skeleton variant="circular" width={32} height={32} animation="wave" />
          <Skeleton variant="text" width="25%" height={20} animation="wave" />
          <Skeleton variant="text" width="15%" height={20} animation="wave" />
          <Skeleton variant="rounded" width={80} height={24} animation="wave" />
          <Skeleton variant="text" width="10%" height={20} animation="wave" sx={{ ml: "auto" }} />
        </Box>
      ))}
    </Card>
  </Box>
);

/**
 * ContentLoader — Loader inline para secciones de contenido.
 * Reemplaza CircularProgress en modales, listas, tablas, etc.
 */
export const ContentLoader = ({ rows = 3, showAvatar = false }) => (
  <Box sx={{ p: 2 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i} sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        {showAvatar && <Skeleton variant="circular" width={40} height={40} animation="wave" />}
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={`${70 - i * 10}%`} height={22} animation="wave" />
          <Skeleton variant="text" width={`${50 - i * 5}%`} height={16} animation="wave" />
        </Box>
      </Box>
    ))}
  </Box>
);

/**
 * CardLoader — Skeleton para tarjetas del panel de control.
 */
export const CardLoader = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item xs={12} sm={6} md={4} key={i}>
        <Card sx={{ borderRadius: 4, height: 160 }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 3 }}>
            <Skeleton variant="rounded" width={56} height={56} animation="wave" sx={{ borderRadius: "16px", mb: 2 }} />
            <Skeleton variant="text" width="70%" height={24} animation="wave" />
            <Skeleton variant="text" width="50%" height={16} animation="wave" />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);
