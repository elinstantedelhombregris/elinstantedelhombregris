import React, { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";

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
const ElMapa = React.lazy(() => import("@/pages/ElMapa"));
const BlogVlog = React.lazy(() => import("@/pages/BlogVlog"));
const BlogPostDetail = React.lazy(() => import("@/pages/BlogPostDetail"));
const LaVision = React.lazy(() => import("@/pages/LaVision"));
const Manifiesto = React.lazy(() => import("@/pages/Manifiesto"));
const DetallesCalculoCostoHumano = React.lazy(() => import("@/pages/DetallesCalculoCostoHumano"));
const UserDashboard = React.lazy(() => import("@/pages/UserDashboard"));
const UserProfile = React.lazy(() => import("@/pages/UserProfile"));
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

type User = {
  id: number;
  username: string;
  name: string;
  email: string;
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
      <Route path="/recursos/guias-estudio" component={StudyGuides} />
      <Route path="/recursos/guias-estudio/:slug" component={CourseDetail} />
      <Route path="/recursos/guias-estudio/:courseSlug/leccion/:lessonId" component={LessonView} />
      <Route path="/recursos/guias-estudio/:courseSlug/quiz" component={QuizView} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
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
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/challenges/:id" component={ChallengeDetail} />

      {/* Life Areas routes */}
      <Route path="/life-areas" component={LifeAreasDashboard} />
      <Route path="/life-areas/:areaId" component={LifeAreaDetail} />
      <Route path="/life-areas/:areaId/quiz" component={LifeAreaQuiz} />

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
        <TooltipProvider>
          <ErrorBoundary>
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
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
