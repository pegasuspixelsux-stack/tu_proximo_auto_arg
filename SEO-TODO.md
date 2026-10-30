# SEO: pendientes fuera del código

## Datos del negocio que faltan (marcados TODO(seo) en `lib/seo.ts` y `Footer.tsx`)
- Dirección completa del salón de Tigre (calle, número, código postal). Hoy el sitio solo dice "Tigre, Zona Norte".
- Coordenadas (geo), horarios de atención y un teléfono de Argentina. El número cargado en el panel (`59891028324`) tiene prefijo +598 (Uruguay).
- URLs de Instagram, Facebook y LinkedIn (hoy los links del footer son `#`). Cargarlas en `BUSINESS.sameAs` y en el footer.
- Confirmar el alcance geográfico: el salón está en Tigre (Zona Norte, GBA), no en CABA. Los textos dicen "Buenos Aires y Zona Norte". No se crearon páginas de barrios; indicá cuáles atendés de verdad y las armamos.
- Páginas legales: Términos, Privacidad, Cookies y Soporte hoy apuntan a `#`.

## Google Search Console
1. Crear propiedad de tipo **Dominio** con `tuproximoauto.online`.
2. Agregar el registro **TXT** que te da Google en el DNS de Hostinger y verificar.
3. Enviar `https://www.tuproximoauto.online/sitemap.xml`.
4. Pedir indexación de `/`, `/autos` y `/concesionarias`.

## Bing Webmaster Tools
Importar el sitio desde Search Console y enviar el mismo sitemap.

## Google Business Profile
Crear y verificar la ficha del salón de Tigre (verificación por correo postal o video). Usar exactamente el mismo nombre, dirección y teléfono que el footer.

## Reseñas y citaciones
- Pedir reseñas en Google a cada cliente que compre, con el link corto de la ficha.
- Presencia con los mismos datos (NAP) en Mercado Libre Autos, Facebook, Instagram, Kavak (si aplica) y directorios locales de Tigre / Zona Norte.
- Backlinks: notas con cámaras o asociaciones de concesionarios, medios locales de zona norte, perfiles de las concesionarias que publican (que linkeen a su ficha en tu sitio).

## Analítica
Agregar Vercel Analytics (`@vercel/analytics`) y/o Google Analytics 4. No se instaló nada porque requiere tu ID de medición.

## Dominio
En Vercel: agregar `tuproximoauto.online` y `www.tuproximoauto.online`. La redirección del dominio sin www hacia www ya está en `next.config.ts` (HTTPS lo fuerza Vercel).
