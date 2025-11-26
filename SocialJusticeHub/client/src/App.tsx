import React, { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";
import Community from "@/pages/Community";
import CreateJob from "@/pages/CreateJob";
import CreateProject from "@/pages/CreateProject";
import CreateResource from "@/pages/CreateResource";
import EditJob from "@/pages/EditJob";
import EditProject from "@/pages/EditProject";
import EditResource from "@/pages/EditResource";
import ResourceDetail from "@/pages/ResourceDetail";
import ElInstanteDelHombreGris from "@/pages/ElInstanteDelHombreGris";
import LaSemillaDeBasta from "@/pages/LaSemillaDeBasta";
import ElMapa from "@/pages/ElMapa";
import BlogVlog from "@/pages/BlogVlog";
import BlogPostDetail from "@/pages/BlogPostDetail";
import LaVision from "@/pages/LaVision";
import Manifiesto from "@/pages/Manifiesto";
import DetallesCalculoCostoHumano from "@/pages/DetallesCalculoCostoHumano";
// Nuevas páginas de usuario
import UserDashboard from "@/pages/UserDashboard";
import UserProfile from "@/pages/UserProfile";
import Challenges from "@/pages/Challenges";
import ChallengeDetail from "@/pages/ChallengeDetail";
import InitiativeDetail from "@/pages/InitiativeDetail";
import Resources from "@/pages/Resources";
import StudyGuides from "@/pages/StudyGuides";
import CourseDetail from "@/pages/CourseDetail";
import LessonView from "@/pages/LessonView";
import QuizView from "@/pages/QuizView";
import LifeAreasDashboard from "@/pages/LifeAreasDashboard";
import LifeAreaQuiz from "@/pages/LifeAreaQuiz";
import LifeAreaDetail from "@/pages/LifeAreaDetail";

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
            <Router />
          </ErrorBoundary>
        </TooltipProvider>
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
