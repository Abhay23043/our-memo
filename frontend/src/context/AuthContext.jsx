import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";


const AuthContext =
    createContext(null);


// =====================================================
// AUTH PROVIDER
// =====================================================

export function AuthProvider({
    children
}) {

    const [
        user,
        setUser
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    // =================================================
    // CHECK CURRENT SESSION
    // =================================================

    const checkAuth =
        async () => {

            try {

                const response =
                    await api.get(
                        "/auth/me"
                    );


                if (
                    response.data?.success &&
                    response.data?.user
                ) {

                    setUser(
                        response.data.user
                    );

                } else {

                    setUser(null);

                }


            } catch (error) {

                // User is not logged in
                setUser(null);

            } finally {

                setLoading(false);

            }

        };


    // =================================================
    // CHECK SESSION ON APP LOAD / REFRESH
    // =================================================

    useEffect(() => {

        checkAuth();

    }, []);


    // =================================================
    // LOGIN USER
    // =================================================
    //
    // Login.jsx can call:
    //
    // setUser(response.data.user)
    //
    // =================================================

    const loginUser =
        (userData) => {

            setUser(
                userData
            );

        };


    // =================================================
    // LOGOUT USER
    // =================================================

    const logoutUser =
        async () => {

            try {

                await api.post(
                    "/auth/logout"
                );

            } catch (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );

            } finally {

                setUser(null);

            }

        };


    // =================================================
    // CONTEXT
    // =================================================

    return (

        <AuthContext.Provider
            value={{

                user,

                setUser,

                loginUser,

                logoutUser,

                loading,

                checkAuth

            }}
        >

            {children}

        </AuthContext.Provider>

    );

}


// =====================================================
// USE AUTH
// =====================================================

export function useAuth() {

    return useContext(
        AuthContext
    );

} 