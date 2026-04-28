import React, { useEffect, useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { ImmersionProvider } from '@/components/ImmersionContext';

const Home = React.lazy(() => import("@/pages/Home"));
const Login = React.lazy(() => import("@/pages/Login"));
const Register = React.lazy(() => import("@/pages/Register"));
const NotFound = React.lazy(() => import("@/pages/not-found"));
const Community = React.lazy(() => import("@/pages/Community"));
const CreateJob = React.lazy(() => import("@/pages/CreateJob"));
const CreateProject = React.lazy(() => import("@/pages/CreateProject"));
const CreateResource = React.lazy(() => import("@/pages/CreateResource"));
const EditJob = React.lazy(() => import("@/pages/EditJob"));
const EditProject = React.lazy(() => import("@/pages/EditProject"));
const EditResource = React.lazy(() => import("@/pages/EditResource"));
const ResourceDetail = React.lazy(() => import("@/pages/ResourceDetail"));
const ElInstanteDelHombreGris = React.lazy(() => import("@/pages/ElInstanteDelHombreGris"));
const LaSemillaDeBasta = React.lazy(() => import("@/pages/LaSemillaDeBasta"));
const UnaRutaParaArgentina = React.lazy(() => import("@/pages/UnaRutaParaArgentina"));
const ElMapa = React.lazy(() => import("@/pages/ElMapa"));
const BlogVlog = React.lazy(() => import("@/pages/BlogVlog"));
const BlogPostDetail = React.lazy(() => import("@/pages/BlogPostDetail"));
const LaVision = React.lazy(() => import("@/pages/LaVision"));
const Manifiesto = React.lazy(() => import("@/pages/Manifiesto"));
const DetallesCalculoCostoHumano = React.lazy(() => import("@/pages/DetallesCalculoCostoHumano"));
const UserDashboard = React.lazy(() => import("@/pages/UserDashboard"));
const UserProfile = React.lazy(() => import("@/pages/UserProfile"));
const PublicProfile = React.lazy(() => import("@/pages/PublicProfile"));
const Challenges = React.lazy(() => import("@/pages/Challenges"));
const ChallengeDetail = React.lazy(() => import("@/pages/ChallengeDetail"));
const InitiativeDetail = React.lazy(() => import("@/pages/InitiativeDetail"));
const Resources = React.lazy(() => import("@/pages/Resources"));
const StudyGuides = React.lazy(() => import("@/pages/StudyGuides"));
const CourseDetail = React.lazy(() => import("@/pages/CourseDetail"));
const LessonView = React.lazy(() => import("@/pages/LessonView"));
const QuizView = React.lazy(() => import("@/pages/QuizView"));
const LifeAreasDashboard = React.lazy(() => import("@/pages/LifeAreasDashboard"));
const LifeAreaQuiz = React.lazy(() => import("@/pages/LifeAreaQuiz"));
const LifeAreaDetail = React.lazy(() => import("@/pages/LifeAreaDetail"));
// LifeAreaResults removed — absorbed into quiz completion + detail page
const Bienvenida = React.lazy(() => import("@/pages/Bienvenida"));
const CivicAssessment = React.lazy(() => import("@/pages/CivicAssessment"));
const InsightDashboard = React.lazy(() => import("@/pages/InsightDashboard"));
const Goals = React.lazy(() => import("@/pages/Goals"));
const WeeklyCheckin = React.lazy(() => import("@/pages/WeeklyCheckin"));
const CoachingChat = React.lazy(() => import("@/pages/CoachingChat"));
const PoliticaPrivacidad = React.lazy(() => import("@/pages/PoliticaPrivacidad"));
const ElMandatoVivo = React.lazy(() => import("@/pages/ElMandatoVivo"));
const MandatoTerritorial = React.lazy(() => import("@/pages/MandatoTerritorial"));
const MandatoPublico = React.lazy(() => import("@/pages/MandatoPublico"));
const DatosAbiertos = React.lazy(() => import("@/pages/DatosAbiertos"));
const ExplorarDatos = React.lazy(() => import("@/pages/ExplorarDatos"));
const PulsoDetalle = React.lazy(() => import("@/pages/PulsoDetalle"));
const PropuestaDetalle = React.lazy(() => import("@/pages/PropuestaDetalle"));
const IniciativaDetalle = React.lazy(() => import("@/pages/IniciativaDetalle"));
const IniciativaDocumento = React.lazy(() => import("@/pages/IniciativaDocumento"));
const Feedback = React.lazy(() => import("@/pages/Feedback"));
const AdminFeedback = React.lazy(() => import("@/pages/AdminFeedback"));
const KitDePrensa = React.lazy(() => import("@/pages/KitDePrensa"));
const MisionDetalle = React.lazy(() => import("@/pages/MisionDetalle"));
const ApoyaAlMovimiento = React.lazy(() => import("@/pages/ApoyaAlMovimiento"));
const Ensayos = React.lazy(() => import("@/pages/Ensayos"));

type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  location?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  emailVerified?: boolean;
  onboardingCompleted?: boolean;
  createdAt?: string | null;
  dataShareOptOut?: boolean;
} | null;

export type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  isLoggedIn: boolean;
};

export const UserContext = React.createContext<UserContextType | undefined>(undefined);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/la-vision" component={LaVision} />
      <Route path="/manifiesto" component={Manifiesto} />
      <Route path="/detalles-calculo-costo-humano" component={DetallesCalculoCostoHumano} />
      <Route path="/el-instante-del-hombre-gris" component={ElInstanteDelHombreGris} />
      <Route path="/la-semilla-de-basta" component={LaSemillaDeBasta} />
      <Route path="/el-mapa" component={ElMapa} />
      {/* Legacy route - redirect to new resources structure */}
      <Route path="/blog-vlog" component={BlogVlog} />
      <Route path="/blog-vlog/:slug" component={BlogPostDetail} />
      {/* New Resources routes */}
      <Route path="/recursos" component={Resources} />
      <Route path="/recursos/blog" component={BlogVlog} />
      <Route path="/recursos/vlog" component={BlogVlog} />
      <Route path="/recursos/blog/:slug" component={BlogPostDetail} />
      <Route path="/recursos/vlog/:slug" component={BlogPostDetail} />
      <Route path="/recursos/guias-estudio" component={StudyGuides} />
      <Route path="/recursos/guias-estudio/:slug" component={CourseDetail} />
      <Route path="/recursos/guias-estudio/:courseSlug/leccion/:lessonId" component={LessonView} />
      <Route path="/recursos/guias-estudio/:courseSlug/quiz" component={QuizView} />
      <Route path="/recursos/ruta" component={UnaRutaParaArgentina} />
      <Route path="/recursos/ruta/iniciativas/:slug/documento" component={IniciativaDocumento} />
      <Route path="/recursos/ruta/iniciativas/:slug" component={IniciativaDetalle} />
      <Route path="/recursos/ensayos" component={Ensayos} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/bienvenida" component={Bienvenida} />
      <Route path="/mision/:slug" component={MisionDetalle} />
      <Route path="/community" component={Community} />
      <Route path="/community/job/create" component={CreateJob} />
      <Route path="/community/project/create" component={CreateProject} />
      <Route path="/community/resource/create" component={CreateResource} />
      <Route path="/community/job/edit/:id" component={EditJob} />
      <Route path="/community/project/edit/:id" component={EditProject} />
      <Route path="/community/resource/edit/:id" component={EditResource} />
      <Route path="/resources/:id" component={ResourceDetail} />
      <Route path="/community/:id" component={InitiativeDetail} />

      {/* Nuevas rutas de usuario */}
      <Route path="/dashboard" component={InsightDashboard} />
      <Route path="/dashboard-legacy" component={UserDashboard} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/u/:username" component={PublicProfile} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/challenges/:id" component={ChallengeDetail} />
      <Route path="/evaluacion" component={CivicAssessment} />
      <Route path="/metas" component={Goals} />
      <Route path="/checkin-semanal" component={WeeklyCheckin} />
      <Route path="/coaching" component={CoachingChat} />

      <Route path="/el-mandato-vivo" component={ElMandatoVivo} />
      <Route path="/politica-privacidad" component={PoliticaPrivacidad} />
      <Route path="/mandato/:level/:name" component={MandatoTerritorial} />
      <Route path="/mandato-publico/:level/:name" component={MandatoPublico} />
      <Route path="/datos-abiertos" component={DatosAbiertos} />
      <Route path="/explorar-datos" component={ExplorarDatos} />
      <Route path="/mandato/pulso/:id" component={PulsoDetalle} />
      <Route path="/mandato/propuesta/:id" component={PropuestaDetalle} />

      {/* Legacy redirects — old Pulso URLs */}
      <Route path="/el-pulso">{() => <Redirect to="/el-mandato-vivo" />}</Route>
      <Route path="/pulso/:id">{(params) => <Redirect to={`/mandato/pulso/${params.id}`} />}</Route>
      <Route path="/propuesta/:id">{(params) => <Redirect to={`/mandato/propuesta/${params.id}`} />}</Route>

      {/* Legacy redirects — old Ruta/Arquitecto/Iniciativas URLs */}
      <Route path="/una-ruta-para-argentina">{() => <Redirect to="/recursos/ruta" />}</Route>
      <Route path="/recursos/el-arquitecto">{() => <Redirect to="/recursos/ruta" />}</Route>
      <Route path="/recursos/iniciativas">{() => <Redirect to="/recursos/ruta" />}</Route>
      <Route path="/recursos/iniciativas/:slug/documento">{(params) => <Redirect to={`/recursos/ruta/iniciativas/${params.slug}/documento`} />}</Route>
      <Route path="/recursos/iniciativas/:slug">{(params) => <Redirect to={`/recursos/ruta/iniciativas/${params.slug}`} />}</Route>

      {/* Kit de Prensa */}
      <Route path="/kit-de-prensa" component={KitDePrensa} />

      {/* Apoyá al Movimiento */}
      <Route path="/apoya-al-movimiento" component={ApoyaAlMovimiento} />

      {/* Feedback */}
      <Route path="/feedback" component={Feedback} />
      <Route path="/admin/feedback" component={AdminFeedback} />

      {/* Life Areas routes */}
      <Route path="/life-areas" component={LifeAreasDashboard} />
      <Route path="/life-areas/:areaId/quiz" component={LifeAreaQuiz} />
      <Route path="/life-areas/:areaId" component={LifeAreaDetail} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await apiRequest('GET', '/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.log('User not authenticated or token expired');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const contextValue = {
    user,
    setUser,
    isLoggedIn: !!user
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={contextValue}>
        <ImmersionProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Analytics />
            <Toaster />
            <React.Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando vista...</p>
                  </div>
                </div>
              }
            >
              <Router />
            </React.Suspense>
          </ErrorBoundary>
        </TooltipProvider>
        </ImmersionProvider>
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
