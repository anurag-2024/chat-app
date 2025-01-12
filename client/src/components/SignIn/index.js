import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"
import { BASE_URL } from "../../utils/url";

const SignIn = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        email: "",
        password: "",
    });
    useEffect(() => {
        const isLoggedInUser=localStorage.getItem('user:token');
        if(isLoggedInUser){
            navigate('/');
        }
    }, [])
    
    const onSignin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })
            const resData = await res.json();
            console.log("userhgjhj")
            console.log('Data received', resData);
            if(resData.status===200 && resData.token){
                localStorage.setItem('user:token',resData.token);
                localStorage.setItem('user:detail',JSON.stringify(resData.user));
                navigate('/');
            }
            else{
                toast.error(resData.message);
            }
        } catch (error) {
            // console.log("jhgdjsjfd");
            console.log(error);
        }


    }
    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="bg-white w-full max-w-xl p-10 max-md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(128,_90,_213,_0.3)]">
                <div className="mb-10 text-center">
                    <h1 className="text-5xl max-md:text-4.5xl font-bold bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 mt-3 text-lg">Sign in to continue your journey</p>
                </div>

                <form onSubmit={onSignin} className="space-y-3">
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-base font-medium text-gray-700 block">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition duration-200 outline-none text-gray-700"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200 outline-none"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="!w-full !bg-gradient-to-r !from-violet-600 !to-rose-500 !text-white !py-4 !px-6 !rounded-xl !font-medium !hover:opacity-90 !transition !duration-200 !transform !hover:scale-[1.02] !text-lg !mt-6"
                    >
                        Sign in
                    </button>
                </form>

                <div className="mt-3 text-center">
                    <p className="text-gray-600 ">
                        New to our platform?{' '}
                        <span 
                            onClick={() => navigate("/users/sign_up")}
                            className="text-violet-600 font-semibold cursor-pointer hover:text-violet-700 transition duration-200"
                        >
                            Create an account
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignIn