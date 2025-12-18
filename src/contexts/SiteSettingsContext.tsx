import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  platform_name: string;
  logo_url: string;
  primary_color: string;
  theme: string;
  banner_image_url: string;
  banner_text: string;
  banner_redirect_url: string;
  header_title: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  platform_name: 'método sociedade',
  logo_url: '',
  primary_color: '#8b5cf6',
  theme: 'dark',
  banner_image_url: '',
  banner_text: '',
  banner_redirect_url: '',
  header_title: 'Area De Mentorados'
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refresh: async () => {}
});

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  // Sempre retorna valores válidos, mesmo se o contexto não estiver disponível
  if (!context) {
    return {
      settings: defaultSettings,
      loading: false,
      refresh: async () => {}
    };
  }
  return context;
};

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(false); // Iniciar como false para não bloquear render

  const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
    try {
      // Remove # se presente e valida formato
      hex = hex.replace('#', '').trim();
      
      // Validar formato hex
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        console.warn('Invalid hex color format:', hex);
        return null;
      }
      
      // Converter para RGB
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h: number, s: number;
      const l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
          default: h = 0;
        }
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      };
    } catch (error) {
      console.error('Error converting hex to HSL:', error);
      return null;
    }
  };

  const applySettings = (settings: SiteSettings) => {
    try {
      // Garantir que o DOM está pronto
      if (typeof document === 'undefined') return;
      
      console.log('🎨 Aplicando configurações:', { 
        primary_color: settings.primary_color, 
        theme: settings.theme 
      });
      
      const root = document.documentElement;
      
      // Aplicar cor primária via CSS variables usando style tag para garantir prioridade
      if (settings.primary_color) {
        const hsl = hexToHsl(settings.primary_color);
        if (hsl) {
          const hslValue = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
          
          // Criar ou atualizar style tag para aplicar cor em :root e .dark
          let styleTag = document.getElementById('dynamic-primary-color') as HTMLStyleElement;
          if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-primary-color';
            document.head.appendChild(styleTag);
          }
          
          styleTag.textContent = `
            :root {
              --primary: ${hslValue} !important;
              --accent: ${hslValue} !important;
              --ring: ${hslValue} !important;
              --sidebar-primary: ${hslValue} !important;
              --sidebar-ring: ${hslValue} !important;
            }
            .dark {
              --primary: ${hslValue} !important;
              --accent: ${hslValue} !important;
              --ring: ${hslValue} !important;
              --sidebar-primary: ${hslValue} !important;
              --sidebar-ring: ${hslValue} !important;
            }
          `;
          
          console.log('✅ Cor primária aplicada:', hslValue, 'HSL:', hsl);
        } else {
          console.warn('⚠️ Falha ao converter cor para HSL:', settings.primary_color);
        }
      }

      // Aplicar tema
      if (settings.theme === 'light') {
        root.classList.remove('dark');
        console.log('✅ Tema claro aplicado');
      } else if (settings.theme === 'dark') {
        root.classList.add('dark');
        console.log('✅ Tema escuro aplicado');
      } else if (settings.theme === 'system') {
        // Sistema: usar preferência do sistema
        if (typeof window !== 'undefined' && window.matchMedia) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
            console.log('✅ Tema sistema (escuro) aplicado');
          } else {
            root.classList.remove('dark');
            console.log('✅ Tema sistema (claro) aplicado');
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações:', error);
      // Não quebrar o app se houver erro
    }
  };

  const loadSettings = async () => {
    try {
      // Usar any para evitar erro de tipo se a tabela não existir no schema
      const { data, error } = await (supabase as any).from('site_settings').select('key, value');
      
      // Se houver erro (tabela não existe, por exemplo), usar defaults
      if (error) {
        console.warn('Site settings table may not exist, using defaults:', error.message);
        setSettings(defaultSettings);
        // Aplicar settings apenas se o DOM estiver pronto
        if (typeof document !== 'undefined') {
          requestAnimationFrame(() => applySettings(defaultSettings));
        }
        setLoading(false);
        return;
      }
      
      let loadedSettings = defaultSettings;
      
      if (data && data.length > 0) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value || '';
        });

        loadedSettings = {
          platform_name: settingsMap.platform_name || defaultSettings.platform_name,
          logo_url: settingsMap.logo_url || '',
          primary_color: settingsMap.primary_color || defaultSettings.primary_color,
          theme: settingsMap.theme || defaultSettings.theme,
          banner_image_url: settingsMap.banner_image_url || '',
          banner_text: settingsMap.banner_text || '',
          banner_redirect_url: settingsMap.banner_redirect_url || '',
          header_title: settingsMap.header_title || defaultSettings.header_title
        };
      }

      setSettings(loadedSettings);
      // Aplicar settings apenas se o DOM estiver pronto
      if (typeof document !== 'undefined') {
        requestAnimationFrame(() => applySettings(loadedSettings));
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
      // Em caso de erro, usar defaults para não quebrar o app
      setSettings(defaultSettings);
      if (typeof document !== 'undefined') {
        requestAnimationFrame(() => applySettings(defaultSettings));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carregar configurações de forma assíncrona para não bloquear o render
    let isMounted = true;
    
    const initializeSettings = async () => {
      try {
        await loadSettings();
      } catch (error) {
        console.error('Failed to initialize settings:', error);
      }
    };

    // Executar após o primeiro render, mas não bloquear
    if (typeof window !== 'undefined') {
      // Usar setTimeout ao invés de requestAnimationFrame para não depender do frame
      setTimeout(() => {
        initializeSettings();
      }, 100);
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh: loadSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
