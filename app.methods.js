import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import SchoolRouter from "./modules/school/school.router.js";
import TeacherRouter from "./modules/Teacher/Teacher.router.js";
import SupervisorRouter from "./modules/Supervisor/supervisor.router.js";
import studentRouter from "./modules/student/student.router.js";
import parentRouter from "./modules/Parent/parent.routes.js";
import bookRouter from "./modules/Book/book.router.js";
import RateTeacher from "./modules/RateTeacherForStudent/RateTeacherForStudent.router.js";
import RateingStudentBookRouter from "./modules/RatingStudentBooks/routes/RateingStudentBookRoutes.js";
import StudentSelfAssessmentRouter from "./modules/StudentSelfAssessment/routes/StudentSelfAssessmentRoutes.js";
import ParentAssessmentRouter from "./modules/ParentAssessment/routes/ParentAssessmentRoutes.js";

dotenv.config();

export const appMethods = (app, express) => {
    app.use(cors());
    app.use(express.json());
    app.use(morgan("dev"));
    app.use("/api/school",SchoolRouter)
    app.use("/api/Teacher",TeacherRouter)
    app.use("/api/Supervisor",SupervisorRouter)
    app.use("/api/student",studentRouter)
    app.use("/api/parent",parentRouter)
    app.use("/api/Book",bookRouter)
    app.use("/api/RateTeacher",RateTeacher)
    app.use("/api/RateingStudentBook",RateingStudentBookRouter)
    app.use("/api/StudentSelfAssessment",StudentSelfAssessmentRouter)
    app.use("/api/ParentAssessment",ParentAssessmentRouter)
    app.get("/", (req, res, next) => {
        const temp = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>نادي الكتاب المدرسي</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Cairo', sans-serif;
                    background-color: #f5f6fa;
                    text-align: center;
                    margin: 0;
                    padding: 0;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .welcome-message {
                    margin-top: 50px;
                    padding: 40px;
                    background-color: #ffffff;
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                h1 {
                    font-size: 42px;
                    color: #2c3e50;
                    margin-bottom: 30px;
                }

                .description {
                    color: #34495e;
                    font-size: 20px;
                    line-height: 1.6;
                    margin-bottom: 40px;
                }

                .user-types {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 40px;
                }

                .user-type {
                    background-color: #fff;
                    padding: 25px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s ease;
                }

                .user-type:hover {
                    transform: translateY(-5px);
                }

                .user-type i {
                    font-size: 40px;
                    color: #3498db;
                    margin-bottom: 15px;
                }

                .user-type h3 {
                    font-size: 24px;
                    color: #2c3e50;
                    margin: 10px 0;
                }

                .user-type p {
                    color: #7f8c8d;
                    font-size: 16px;
                }

                .features {
                    margin-top: 60px;
                    text-align: right;
                }

                .feature {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                }

                .feature h4 {
                    color: #2c3e50;
                    margin: 0 0 10px 0;
                }

                .feature p {
                    color: #7f8c8d;
                    margin: 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="welcome-message">
                    <h1>مرحباً بك في نادي الكتاب المدرسي</h1>
                    <p class="description">منصة تعليمية متكاملة تجمع بين الطلاب والمعلمين وأولياء الأمور لتعزيز حب القراءة والتعلم</p>
                    
                    <div class="user-types">
                        <div class="user-type">
                            <i class="fas fa-user-graduate"></i>
                            <h3>الطلاب</h3>
                            <p>اكتشف عالم القراءة وشارك تجربتك مع زملائك</p>
                        </div>
                        <div class="user-type">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <h3>المعلمون</h3>
                            <p>تابع تقدم طلابك وقدم التوجيه المناسب</p>
                        </div>
                        <div class="user-type">
                            <i class="fas fa-user-friends"></i>
                            <h3>أولياء الأمور</h3>
                            <p>راقب تقدم أبنائك وشارك في رحلتهم التعليمية</p>
                        </div>
                        <div class="user-type">
                            <i class="fas fa-user-shield"></i>
                            <h3>المشرفون</h3>
                            <p>أدر النظام وتابع الإحصائيات والتقارير</p>
                        </div>
                    </div>

                    <div class="features">
                        <h2>مميزات النظام</h2>
                        <div class="feature">
                            <h4>تقييم شامل</h4>
                            <p>نظام تقييم متكامل للكتب والبرنامج والطلاب</p>
                        </div>
                        <div class="feature">
                            <h4>تحليل البيانات</h4>
                            <p>تقارير تفصيلية وإحصائيات دقيقة لقياس التقدم</p>
                        </div>
                        <div class="feature">
                            <h4>تفاعل مستمر</h4>
                            <p>تواصل مباشر بين جميع المستخدمين لتحسين التجربة التعليمية</p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
        res.status(200).header('Content-Type', 'text/html').send(temp);
    });
    
    app.use((err, req, res, next) => {
        const status = err.status || 500;
        res.status(status).json({
            status: status,
            success: false,
            message: err.message || "Internal Server Error"
        });
    });

    app.all("*", (req, res, next) => {
        return next(new Error("Not Found Page!", { cause: 404 }));
    });

    const Port = process.env.PORT
    app.listen(Port, () => {
        console.log(`Server Is Running On Port ${Port}`);
    });
}