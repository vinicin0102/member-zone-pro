import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, BookOpen, Video } from 'lucide-react';

interface Module { id: string; title: string; description: string | null; order: number; }
interface Lesson { id: string; module_id: string; title: string; description_html: string | null; video_vturb_url: string | null; order: number; is_premium: boolean; }

const Admin = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({ title: '', description_html: '', video_vturb_url: '', is_premium: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: modulesData } = await supabase.from('courses_modules').select('*').order('order');
    if (modulesData) setModules(modulesData);
    const { data: lessonsData } = await supabase.from('courses_lessons').select('*').order('order');
    if (lessonsData) setLessons(lessonsData);
    setLoading(false);
  };

  const addModule = async () => {
    if (!newModule.title) return;
    const { error } = await supabase.from('courses_modules').insert({ title: newModule.title, description: newModule.description, order: modules.length + 1 });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Módulo criado!' });
    setNewModule({ title: '', description: '' });
    fetchData();
  };

  const deleteModule = async (id: string) => {
    const { error } = await supabase.from('courses_modules').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Módulo excluído' });
    fetchData();
  };

  const addLesson = async () => {
    if (!newLesson.title || !selectedModule) return;
    const moduleLessons = lessons.filter(l => l.module_id === selectedModule);
    const { error } = await supabase.from('courses_lessons').insert({ 
      module_id: selectedModule, title: newLesson.title, description_html: newLesson.description_html, 
      video_vturb_url: newLesson.video_vturb_url, is_premium: newLesson.is_premium, order: moduleLessons.length + 1 
    });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Aula criada!' });
    setNewLesson({ title: '', description_html: '', video_vturb_url: '', is_premium: false });
    fetchData();
  };

  const deleteLesson = async (id: string) => {
    const { error } = await supabase.from('courses_lessons').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Aula excluída' });
    fetchData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Carregando...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/members')}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="font-display font-semibold text-lg">Painel Admin</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-2">
        {/* Modules */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Módulos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input placeholder="Título do módulo" value={newModule.title} onChange={e => setNewModule(p => ({ ...p, title: e.target.value }))} />
              <Textarea placeholder="Descrição" value={newModule.description} onChange={e => setNewModule(p => ({ ...p, description: e.target.value }))} />
              <Button onClick={addModule} className="w-full gap-2"><Plus className="w-4 h-4" />Adicionar Módulo</Button>
            </div>
            <div className="space-y-2">{modules.map(m => (
              <div key={m.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedModule === m.id ? 'bg-primary/10 border-primary' : 'hover:bg-secondary'}`} onClick={() => setSelectedModule(m.id)}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{m.title}</span>
                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteModule(m.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}</div>
          </CardContent>
        </Card>
        {/* Lessons */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Video className="w-5 h-5" />Aulas {selectedModule && `- ${modules.find(m => m.id === selectedModule)?.title}`}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {selectedModule ? (
              <>
                <div className="space-y-2">
                  <Input placeholder="Título da aula" value={newLesson.title} onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))} />
                  <Input placeholder="URL do vídeo VTurb" value={newLesson.video_vturb_url} onChange={e => setNewLesson(p => ({ ...p, video_vturb_url: e.target.value }))} />
                  <Textarea placeholder="Descrição HTML (suporta links)" value={newLesson.description_html} onChange={e => setNewLesson(p => ({ ...p, description_html: e.target.value }))} rows={4} />
                  <div className="flex items-center gap-2"><Switch checked={newLesson.is_premium} onCheckedChange={c => setNewLesson(p => ({ ...p, is_premium: c }))} /><Label>Premium</Label></div>
                  <Button onClick={addLesson} className="w-full gap-2"><Plus className="w-4 h-4" />Adicionar Aula</Button>
                </div>
                <div className="space-y-2">{lessons.filter(l => l.module_id === selectedModule).map(l => (
                  <div key={l.id} className="p-3 rounded-lg border flex justify-between items-center">
                    <span className="font-medium">{l.title} {l.is_premium && <span className="text-xs text-premium ml-2">Premium</span>}</span>
                    <Button variant="ghost" size="icon" onClick={() => deleteLesson(l.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}</div>
              </>
            ) : <p className="text-muted-foreground text-center py-8">Selecione um módulo</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
