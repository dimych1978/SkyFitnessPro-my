import Header from "./Header";
import { useParams, useNavigate } from "react-router-dom";
import { HeroImage } from "./HeroImages";
import Login from "./Login";
import { auth, database } from "../firebase";
import { useEffect, useState } from "react";
import { ref, set, get, update, onValue } from "firebase/database";
import { useModal } from "../hooks/useModal";
import useWriteDataInBase from "../hooks/useWriteDataInBase";

type TrainingItem = {
  _id: string | undefined;
  urlImg: string;
  trainType: string;
  nameRU: string;
  calendar: string;
  time: string;
  level: string;
  workouts: [];
  fitting: string[];
  directions: string[];
};

const ItemsComponent: React.FC<{ index: number; item: string }> = ({
  index,
  item,
}) => {
  return (
    <div
      key={index}
      className="flex h-[141px] w-[343px] desktop:w-[370px] items-center gap-x-[17px] rounded-[28px] bg-gradient-to-r from-[#151720] to-[#1E212E] p-[20px] first:h-[141px] mr-[8px]"
    >
      <p className="text-[75px] font-medium text-[#BCEC30]">{index + 1}</p>
      <p className="text-[20px] font-normal leading-[22.4px] text-white">
        {item}
      </p>
    </div>
  );
};

const ItemsComponentItem: React.FC<{ index: number; item: string }> = ({
  index,
  item,
}) => {
  return (
    <div key={index} className="flex sm:mb-0">
      <div className="flex items-center gap-x-[8px] sm:gap-x-[30px]">
        <img
          src="/star.svg"
          alt="logo"
          className="w-[19.5px] h-[19.5px] sm:w-[26px] sm:h-[26px]"
        />
        <p className="text-[18px] sm:text-[24px] font-normal leading-[22px] sm:leading-[26.4px] text-black">
          {item}
        </p>
      </div>
    </div>
  );
};



export const CoursePagesComp = () => {
  const params = useParams<{ nameEN: string | undefined }>();
  const { kindOfModal, changeOpenValue } = useModal();
  const [userCourses, setUserCourses] = useState<string[]>([]);
  const [items, setItems] = useState<TrainingItem[]>([]);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const navigate = useNavigate();

  const train = items.find(
    (item: TrainingItem) => item._id === params?.nameEN,
  ) as TrainingItem | undefined;

  const fittings: string[] = train ? train.fitting : [];
  const directions: string[] = train ? train.directions : [];

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setIsAuth(!!user);
      if (user) fetchUserCourses(user.uid);
    });
  }, []);

  const fetchUserCourses = async (uid: string) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Ошибка при получении данных пользователя ", error);
    }
  };

  useEffect(() => {
    const dataRef = ref(database, "/courses");
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setItems(data);
    });
  }, [database]);

  // const writeUserDataInBase = async (uid: string, courseID: string) => {
  //   try {
  //     const coursesRef = ref(database, "/courses");
  //     const coursesSnapshot = await get(coursesRef);
  //     const allCourses = coursesSnapshot.val();

  //     if (!allCourses || !Array.isArray(allCourses)) {
  //       console.error("Courses data массив не правильного формата");
  //       return;
  //     }

  //     const courseData = allCourses.find(
  //       (course: any) => course._id === courseID,
  //     );
  //     if (!courseData) {
  //       console.error("в Course data не найден course ID:", courseID);
  //       return;
  //     }

  //     const courseWorkouts = courseData.workouts || [];
  //     const userRef = ref(database, `users/${uid}`);
  //     const snapshot = await get(userRef);

  //     if (snapshot.exists()) {
  //       const userData = snapshot.val();
  //       const currentCourses = userData.courses || [];
  //       const currentWorkouts = userData.workouts || [];

  //       if (!currentCourses.includes(courseID)) {
  //         await update(userRef, {
  //           courses: [...currentCourses, courseID],
  //           workouts: {
  //             ...currentWorkouts,
  //             ...Object.fromEntries(
  //               courseWorkouts.map((workout: string) => [workout, 0]),
  //             ),
  //           },
  //         });
  //         setUserCourses([...currentCourses, courseID]);
  //       }
  //     } else {
  //       const formattedWorkouts = Object.fromEntries(
  //         courseWorkouts.map((workout: string) => [workout, 0]),
  //       );

  //       const newUserData = {
  //         _id: uid,
  //         courses: [courseID],
  //         workouts: formattedWorkouts,
  //       };
  //       await set(userRef, newUserData);
  //       setUserCourses([courseID]);
  //     }
  //   } catch (error) {
  //     console.error("Ошибка при добавлении данных к пользователю", error);
  //   }
  // };

  const handleAddCourse = async () => {
    if (auth.currentUser && params.nameEN) {
      await useWriteDataInBase(
        auth.currentUser.uid,
        params.nameEN,
        setUserCourses,
      );
      navigate("/user");
    } else {
      console.error(
        "Пользователь не авторизован или идентификатор курса отсутствует",
      );
    }
  };

  const isCourseAdded = userCourses.includes(params.nameEN || "");

  const openModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    changeOpenValue();
  };

  return (
    <div className="max-width-[375px] flex min-h-screen flex-col items-center justify-center">
      <div className="min-h-[500px] min-w-[375px] max-w-[1160px] overflow-x-hidden desktop:overflow-visible">
      <Header />
      <div className=" w-[375px] desktop:mt-[60px] mt-[40px] px-[16px] desktop:px-[0px] desktop:w-[1160px] ">
        <HeroImage param={params.nameEN} />
        <p className="decoration-skip-ink-none mb-0 desktop:mb-[40px] desktop:mt-[60px] h-[26px]  gap-0 text-left text-[24px] font-medium leading-[26.4px] text-black desktop:text-[40px] desktop:leading-[44px]">
          Подойдет для вас, если:
        </p>
        <div className="mt-[26px] flex h-[457px] flex-wrap justify-between  sm:h-auto">
          {fittings.map((item, index) => (
            <ItemsComponent item={item} index={index} key={index} />
          ))}
        </div>
        <section className="relative ">
          <div className="relative z-[1]">
            <p className="mt-[40px] mb-[24px] text-left font-['Roboto'] text-[24px] font-medium leading-[26.4px] text-black sm:text-[44px] desktop:text-[40px] desktop:leading-[44px]">
              Направления
            </p>

            <div className="z-[3] relative box-border grid h-auto w-[343px] grid-cols-1 gap-[10px] rounded-[28px] bg-btnPrimaryRegular p-[30px] sm:h-[336px] sm:w-[1160px] sm:grid-cols-3 gap-[30px]  desktop:h-[146px] desktop:w-[1160px] desktop:content-center ">
              {directions.map((item, index) => (
                <ItemsComponentItem item={item} index={index} key={index} />
              ))}

            </div>
          </div>
          <img
                className=" desktop:hidden absolute left-[-40px] w-[900px] top-[420px]  mx-auto "
                src="/vector_6084.png"
                alt="overlay"
                width={300}
                height={100}
                />
          <img
            className="desktop:hidden z-[5] absolute right-0 left-[80px] top-[287px] mx-auto"
            src="/forestGump.png"
            alt="logo"
            width={505}
            height={100}
            />

          <div className="mb-[60px] mt-[200px] desktop:mt-[105px]">
            <div className="desktop:hidden shadowBlack013 [412px] relative z-20 box-border flex w-[343px] rounded-[30px] bg-white bg-[right_55px_top_120px] bg-no-repeat p-[40px] desktop:h-[486px] desktop:w-[1160px]">
              <div className="pb-[40px]">
                <p className="mb-[28px] text-[32px] font-semibold leading-[35.2px] text-black desktop:text-[60px] desktop:leading-[60px]">
                  Начните путь <br /> к новому телу
                </p>
                <ul className="mb-[28px] pl-[20px]">
                    <li className="corPageTextBlack06 list-disc text-[18px] leading-[36px] desktop:text-[24px] desktop:leading-[28px]">
                      проработка всех групп мышц
                    </li>
                    <li className="corPageTextBlack06 list-disc text-[18px] leading-[36px] desktop:text-[24px] desktop:leading-[28px]">
                      тренировка суставов
                    </li>
                    <li className="corPageTextBlack06 list-disc text-[18px] leading-[36px] desktop:text-[24px] desktop:leading-[28px]">
                      улучшение циркуляции крови
                    </li>
                    <li className="corPageTextBlack06 list-disc text-[18px] leading-[36px] desktop:text-[24px] desktop:leading-[28px]">
                      упражнения заряжают бодростью
                    </li>
                    <li className="corPageTextBlack06 list-disc text-[18px] leading-[36px] desktop:text-[24px] desktop:leading-[28px]">
                      помогают противостоять стрессам
                    </li>
                  </ul>
                {isAuth ? (
                  isCourseAdded ? (
                    <button className="buttonPrimary w-[283px] hover:bg-btnPrimaryHover active:bg-btnPrimaryActive desktop:w-[437px]">
                      Перейти
                    </button>
                  ) : (
                    <button
                      className="buttonPrimary w-[283px] hover:bg-btnPrimaryHover active:bg-btnPrimaryActive desktop:w-[437px]"
                      onClick={handleAddCourse}
                      >
                      Добавить курс
                    </button>
                  )
                ) : (
                  <button
                  className="buttonPrimary w-[283px] hover:bg-btnPrimaryHover active:bg-btnPrimaryActive desktop:w-[437px]"
                    onClick={openModal}
                  >
                    Войдите, чтобы добавить курс
                  </button>
                )}
              </div>
            </div>
            <div className="hidden desktop:block shadowBlack013 relative box-border flex h-[486px] w-[1160px] rounded-[30px] bg-white bg-[url(/vector_6084.png)] bg-[right_55px_top_120px] bg-no-repeat p-[40px]">
              <div className="pb-[40px]">
                <p className="mb-[28px] text-[60px] font-semibold leading-[60px] text-black">
                  Начните путь <br /> к новому телу
                </p>
                <ul className="mb-[28px] pl-[20px]">
                  <li className="corPageTextBlack06 list-disc text-[24px]">
                    проработка всех групп мышц
                  </li>
                  <li className="corPageTextBlack06 list-disc text-[24px]">
                    тренировка суставов
                  </li>
                  <li className="corPageTextBlack06 list-disc text-[24px]">
                    улучшение циркуляции крови
                  </li>
                  <li className="corPageTextBlack06 list-disc text-[24px]">
                    упражнения заряжают бодростью
                  </li>
                  <li className="corPageTextBlack06 list-disc text-[24px]">
                    помогают противостоять стрессам
                  </li>
                </ul>
                {isAuth ? (
                  isCourseAdded ? (
                    <button className="buttonPrimary w-[437px] hover:bg-btnPrimaryHover active:bg-btnPrimaryActive">
                      Перейти
                    </button>
                  ) : (
                    <button
                      className="buttonPrimary w-[437px] hover:bg-btnPrimaryHover active:bg-btnPrimaryActive"
                      onClick={handleAddCourse}
                    >
                      Добавить курс
                    </button>
                  )
                ) : (
                  <button
                    className="buttonPrimary w-[437px] hover:bg-btnPrimaryHover active:bg-btnPrimaryActive"
                    onClick={openModal}
                  >
                    Войдите, чтобы добавить курс
                  </button>
                )}
              </div>
              <img
                className="absolute bottom-5 right-10"
                src="/forestGump.png"
                alt="logo"
                width={505}
                height={100}
              />
            </div>
          </div>
        </section>

        {kindOfModal === "login" && <Login />}
      </div>
      </div>
    </div>
  );
};
