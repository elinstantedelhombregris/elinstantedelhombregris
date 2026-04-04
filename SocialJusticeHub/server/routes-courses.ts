import type { Express } from "express";
import { storage } from "./storage";
import { authenticateToken, optionalAuth, type AuthRequest } from './auth';

export function registerCourseRoutes(app: Express) {
  // ==================== COURSE ENDPOINTS ====================

  // GET /api/courses - List all courses with filters
  app.get("/api/courses", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const category = req.query.category as string | undefined;
      const level = req.query.level as string | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
      const sortBy = req.query.sortBy as string | undefined;
      // Only filter by featured if explicitly provided in query
      const featured = req.query.featured !== undefined ? req.query.featured === 'true' : undefined;

      const result = await storage.getCourses({
        category,
        level,
        search,
        page,
        limit,
        sortBy,
        featured
      });

      // If user is authenticated, add progress info
      if (req.user?.userId) {
        const coursesWithProgress = await Promise.all(
          result.courses.map(async (course) => {
            const progress = await storage.getUserCourseProgress(req.user!.userId, course.id);
            return {
              ...course,
              userProgress: progress || null
            };
          })
        );
        res.json({ ...result, courses: coursesWithProgress });
      } else {
        res.json(result);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Error fetching courses" });
    }
  });

  // GET /api/courses/:slug - Get course by slug with lessons and quiz
  app.get("/api/courses/:slug", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { slug } = req.params;
      const course = await storage.getCourseBySlug(slug);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (!course.isPublished) {
        return res.status(404).json({ message: "Course not found" });
      }

      await storage.incrementCourseView(course.id);

      // Get lessons
      const courseData = await storage.getCourseWithLessons(course.id);
      if (!courseData) {
        return res.status(404).json({ message: "Course data not found" });
      }

      // Get quiz
      const quizData = await storage.getCourseQuiz(course.id);

      // Get user progress if authenticated
      let userProgress = null;
      let userQuizAttempts = null;
      let completedLessons: number[] = [];
      if (req.user?.userId) {
        userProgress = await storage.getUserCourseProgress(req.user.userId, course.id);
        if (userProgress?.completedLessons) {
          completedLessons = JSON.parse(userProgress.completedLessons);
        }
        if (quizData) {
          userQuizAttempts = await storage.getUserQuizAttempts(req.user.userId, quizData.quiz.id);
        }
      }

      res.json({
        course: { ...course, viewCount: (course.viewCount || 0) + 1 },
        lessons: courseData.lessons,
        quiz: quizData ? { ...quizData.quiz, questions: quizData.questions } : null,
        userProgress,
        completedLessons,
        userQuizAttempts: userQuizAttempts || []
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Error fetching course" });
    }
  });

  // GET /api/courses/:courseId/progress - Get user progress in a course
  app.get("/api/courses/:courseId/progress", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const id = parseInt(courseId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const progress = await storage.getUserCourseProgress(req.user!.userId, id);
      
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }

      // Get current lesson details if exists
      let currentLesson = null;
      if (progress.currentLessonId) {
        const courseData = await storage.getCourseWithLessons(id);
        if (courseData) {
          currentLesson = courseData.lessons.find(l => l.id === progress.currentLessonId);
        }
      }

      // Get completed lessons IDs
      const completedLessonsIds = JSON.parse(progress.completedLessons || '[]') as number[];

      res.json({
        progress,
        currentLesson,
        completedLessons: completedLessonsIds
      });
    } catch (error) {
      console.error("Error fetching course progress:", error);
      res.status(500).json({ message: "Error fetching course progress" });
    }
  });

  // POST /api/courses/:courseId/start - Start a course
  app.post("/api/courses/:courseId/start", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const id = parseInt(courseId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const courseById = await storage.getCourseById(id);
      if (!courseById) {
        return res.status(404).json({ message: "Course not found" });
      }
      if (!courseById.isPublished) {
        return res.status(403).json({ message: "Course is not published" });
      }
      if (courseById.requiresAuth && !req.user) {
        return res.status(401).json({ message: "Course requires authentication" });
      }

      const progress = await storage.startCourse(req.user!.userId, id);
      res.json({ progress });
    } catch (error) {
      console.error("Error starting course:", error);
      res.status(500).json({ message: "Error starting course" });
    }
  });

  // POST /api/courses/:courseId/lessons/:lessonId/complete - Complete a lesson
  app.post("/api/courses/:courseId/lessons/:lessonId/complete", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { courseId, lessonId } = req.params;
      const lessonIdNum = parseInt(lessonId);
      const courseIdNum = parseInt(courseId);
      
      if (isNaN(lessonIdNum) || isNaN(courseIdNum)) {
        return res.status(400).json({ message: "Invalid course or lesson ID" });
      }

      // Verify course is started - if not, start it automatically
      let progress = await storage.getUserCourseProgress(req.user!.userId, courseIdNum);
      if (!progress) {
        // Auto-start the course if not started
        await storage.startCourse(req.user!.userId, courseIdNum);
        progress = await storage.getUserCourseProgress(req.user!.userId, courseIdNum);
        if (!progress) {
          return res.status(500).json({ message: "Could not start course" });
        }
      }

      const lesson = await storage.getLessonById(lessonIdNum);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      if (lesson.courseId !== courseIdNum) {
        return res.status(400).json({ message: "Lesson does not belong to this course" });
      }

      const result = await storage.completeLesson(req.user!.userId, lessonIdNum);
      res.json(result);
    } catch (error) {
      console.error("Error completing lesson:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error completing lesson" 
      });
    }
  });

  // POST /api/courses/:courseId/lessons/:lessonId/track-time - Track time spent on lesson
  app.post("/api/courses/:courseId/lessons/:lessonId/track-time", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { lessonId, courseId } = req.params;
      // Accept both 'timeSpent' and 'seconds' for compatibility
      const { timeSpent, seconds } = req.body;
      const timeValue = seconds !== undefined ? seconds : timeSpent;
      const lessonIdNum = parseInt(lessonId);
      const courseIdNum = parseInt(courseId);
      
      if (isNaN(lessonIdNum) || isNaN(courseIdNum)) {
        return res.status(400).json({ message: "Invalid lesson ID or course ID" });
      }

      if (timeValue === undefined || typeof timeValue !== 'number' || timeValue < 0) {
        return res.status(400).json({ message: "Invalid timeSpent value" });
      }

      // Verify course is started (optional - allow tracking even if not started)
      // This allows tracking time for visitors who later register
      await storage.updateLessonTimeSpent(req.user!.userId, lessonIdNum, timeValue);
      res.json({ message: "Time tracked successfully" });
    } catch (error) {
      console.error("Error tracking time:", error);
      res.status(500).json({ message: "Error tracking time" });
    }
  });

  // GET /api/courses/:courseId/quiz - Get quiz for a course
  app.get("/api/courses/:courseId/quiz", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const id = parseInt(courseId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const quizData = await storage.getCourseQuiz(id);
      
      if (!quizData) {
        return res.status(404).json({ message: "Quiz not found for this course" });
      }

      // Get user attempts if authenticated
      let attempts: any[] = [];
      if (req.user && req.user.userId) {
        attempts = await storage.getUserQuizAttempts(req.user.userId, quizData.quiz.id);
      }

      res.json({
        quiz: quizData.quiz,
        questions: quizData.questions,
        attempts
      });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Error fetching quiz" });
    }
  });

  // POST /api/courses/:courseId/quiz/attempt - Start a quiz attempt
  app.post("/api/courses/:courseId/quiz/attempt", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const id = parseInt(courseId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      // Get quiz
      const quizData = await storage.getCourseQuiz(id);
      if (!quizData) {
        return res.status(404).json({ message: "Quiz not found for this course" });
      }

      const courseData = await storage.getCourseWithLessons(id);
      const progress = await storage.getUserCourseProgress(req.user!.userId, id);
      const completedLessons = progress?.completedLessons
        ? JSON.parse(progress.completedLessons)
        : [];
      const requiredLessonIds = (courseData?.lessons ?? [])
        .filter((lesson) => lesson.isRequired)
        .map((lesson) => lesson.id);

      const hasUnlockedQuiz = requiredLessonIds.length === 0
        ? true
        : requiredLessonIds.every((lessonId) => completedLessons.includes(lessonId));

      if (!hasUnlockedQuiz) {
        return res.status(403).json({
          message: "Complete las lecciones requeridas antes de iniciar el quiz",
        });
      }

      // Check max attempts
      if (quizData.quiz.maxAttempts !== null) {
        const attempts = await storage.getUserQuizAttempts(req.user!.userId, quizData.quiz.id);
        if (attempts.length >= quizData.quiz.maxAttempts) {
          return res.status(403).json({ 
            message: `Maximum attempts (${quizData.quiz.maxAttempts}) reached` 
          });
        }
      }

      // Create attempt
      const attempt = await storage.createQuizAttempt(
        req.user!.userId,
        quizData.quiz.id,
        id
      );

      res.json({
        attemptId: attempt.id,
        questions: quizData.questions.map(q => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options ? JSON.parse(q.options) : null,
          points: q.points,
          orderIndex: q.orderIndex
        }))
      });
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      res.status(500).json({ message: "Error creating quiz attempt" });
    }
  });

  // POST /api/courses/:courseId/quiz/attempt/:attemptId/submit - Submit quiz answers
  app.post("/api/courses/:courseId/quiz/attempt/:attemptId/submit", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { attemptId } = req.params;
      const { answers } = req.body;
      const attemptIdNum = parseInt(attemptId);
      
      if (isNaN(attemptIdNum)) {
        return res.status(400).json({ message: "Invalid attempt ID" });
      }

      if (!Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers must be an array" });
      }

      // Verify attempt belongs to user
      const attempt = await storage.getQuizAttempt(attemptIdNum);
      if (!attempt) {
        return res.status(404).json({ message: "Quiz attempt not found" });
      }
      if (attempt.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Check time limit if exists
      if (!attempt.courseId) {
        return res.status(400).json({ message: "Quiz attempt has no course ID" });
      }
      const quizData = await storage.getCourseQuiz(attempt.courseId);
      if (quizData?.quiz.timeLimit) {
        const timeSpent = attempt.startedAt
          ? Math.floor((new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000 / 60)
          : 0;
        if (timeSpent > quizData.quiz.timeLimit) {
          return res.status(400).json({ message: "Time limit exceeded" });
        }
      }

      const result = await storage.submitQuizAttempt(attemptIdNum, answers);
      res.json(result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error submitting quiz" 
      });
    }
  });

  // GET /api/courses/:courseId/certificate - Get certificate for a course
  app.get("/api/courses/:courseId/certificate", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const id = parseInt(courseId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const certificates = await storage.getUserCertificates(req.user!.userId);
      const certificate = certificates.find(c => c.courseId === id);

      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      // Get course details
      const courseData = await storage.getCourseWithLessons(id);
      if (!courseData) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.json({
        certificate,
        course: courseData.course
      });
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ message: "Error fetching certificate" });
    }
  });

  // GET /api/user/courses - Get user's courses
  app.get("/api/user/courses", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userCourses = await storage.getUserCourses(req.user!.userId);
      res.json({
        courses: userCourses.map(({ course, progress }) => ({
          ...course,
          userProgress: progress,
        })),
      });
    } catch (error) {
      console.error("Error fetching user courses:", error);
      res.status(500).json({ message: "Error fetching user courses" });
    }
  });

  // GET /api/user/certificates - Get user's certificates
  app.get("/api/user/certificates", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const certificates = await storage.getUserCertificates(req.user!.userId);
      
      // Get course details for each certificate
      const certificatesWithCourses = await Promise.all(
        certificates.map(async (cert) => {
          if (!cert.courseId) {
            return {
              ...cert,
              course: null
            };
          }
          const courseData = await storage.getCourseWithLessons(cert.courseId);
          return {
            ...cert,
            course: courseData?.course || null
          };
        })
      );

      res.json({ certificates: certificatesWithCourses });
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Error fetching certificates" });
    }
  });
}
