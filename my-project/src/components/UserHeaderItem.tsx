import { auth } from "../firebase";
import React, { useEffect, useState } from "react";
import { HeaderUserPopUp } from "./HeaderPopUp";
import { useModal } from "../hooks/useModal";
import Registry from "./Registry";
import Login from "./Login";
import { onAuthStateChanged } from "firebase/auth";

function UserHeaderItem() {
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const { changeValue, isRegistry } = useModal();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    });
  }, []);

  const openModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    changeValue();
  };

  const togglePopup = () => {
    setPopupOpen((prev) => !prev);
  };

  return (
    <>
      {isAuth ? (
        <>
          <div className="z-40 flex items-start">
            <div
              onClick={() => togglePopup()}
              className="flex cursor-pointer items-center"
            >
              <img
                className="rounded-[46px]"
                src={auth.currentUser?.photoURL ?? "/profile.svg"}
                alt="logo"
                width={42}
                height={42}
              />
              <p className="ml-[16px] mr-[12px] select-none font-[roboto] text-[24px] font-normal">
                {auth.currentUser?.displayName ?? "Гость"}
                
              </p>
              <img
                src="/rectangle_3765.svg"
                alt="logo"
                width={14}
                height={11}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <button
            onClick={openModal}
            className="buttonPrimary z-40 w-[103px] hover:bg-btnPrimaryHover active:bg-btnPrimaryActive disabled:bg-btnPrimaryInactive"
          >
            Войти
          </button>
        </>
      )}
      {popupOpen && (
        <div className="box absolute right-[0px] top-[70px] z-50">
          <HeaderUserPopUp setPopupOpen={setPopupOpen} />
        </div>
      )}
      {isRegistry ? <Registry /> : <Login />}
    </>
  );
}

export default UserHeaderItem;