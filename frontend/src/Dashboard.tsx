import "./DashBoard.css";
import Sidebar from "./components/SideBar";
import ProfileHeader from "./components/ProfileHeader";
import WelcomeBanner from "./components/WelcomeBanner";
import AcademicInfo from "./components/AcademicInfo";
import AcademicSurvey from "./components/AcademicSurvey";
import AvatarImage from "./assets/image.jpg";
import { Routes, Route } from "react-router-dom";
import AcademicPage from "./pages/AcademicPage";
import SchedulePage from "./pages/SchedulePage";
import CoursesPage from "./pages/CoursesPage";

function DashBoard() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <ProfileHeader name="Ana María García" role="Estudiante" avatarUrl={AvatarImage} />
        <Routes>
          <Route path="/" element={
            <div className="content-wrapper">
              <WelcomeBanner name="Ana María" message="Tu progreso académico está en buen camino" average={4.2} />
              <AcademicInfo
                career="Ingeniería en Sistemas"
                semester="6° Semestre"
                credits={124}
                totalCredits={180}
                period="2025-1"
                status="En curso"
              />
              <AcademicSurvey />
            </div>
          } />
          <Route path="/academico" element={<AcademicPage />} />
          <Route path="/horario" element={<SchedulePage />} />
          <Route path="/cursos" element={<CoursesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default DashBoard;
