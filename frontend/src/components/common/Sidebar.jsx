import { useState } from "react"; // Import useState
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CgLogOut } from "react-icons/cg";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => 
{
    const queryClient = useQueryClient();
    const [badgeVisible, setBadgeVisible] = useState(true); // State to manage badge visibility

    const { mutate: logout } = useMutation({
        mutationFn: async () => 
		{
            try
			{
                const res = await fetch("/api/auth/logout", 
				{
                    method: "POST",
                });
                const data = await res.json();

                if (!res.ok) 
				{
                    throw new Error(data.error || "Something went wrong");
                }
            } 
			catch (error) 
			{
                throw new Error(error);
            }
        },
        onSuccess: () => 
		{
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: () => 
		{
            toast.error("Logout attempt failed");
        },
    });

    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    // get unread notifications count
    const { data: unreadCount } = useQuery({
        queryKey: ["unreadNotificationsCount"],
        queryFn: async () => 
		{
            const res = await fetch("/api/notifications/unread-count");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch unread notifications");
            return data.count; 
        },
    });

    return (
        <div className='md:flex-[2_2_0] w-18 max-w-52'>
            <div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
                <Link to='/' className='flex justify-center md:justify-start'>
                    <img
                        src='/assets/sblogo.png'
                        alt='Logo'
                        className='px-0 w-50 h-25 text-center fill-white hover:bg-stone-900'
                    />
                </Link>
                <ul className='flex flex-col gap-3 mt-4'>
                    <li className='flex justify-center md:justify-start'>
                        <Link
                            to='/'
                            className='flex gap-3 items-center hover:bg-stone-800 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
                        >
                            <MdHomeFilled className='w-8 h-8' />
                            <span className='text-lg hidden md:block'>Home</span>
                        </Link>
                    </li>
                    <li className='flex justify-center md:justify-start relative'>
                        <Link
                            to='/notifications'
                            className='flex gap-3 items-center hover:bg-stone-800 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
                            onClick={() => setBadgeVisible(false)} // hide badge when it's clicked
                        >
                            <IoNotifications className='w-6 h-6' />
                            <span className='text-lg hidden md:block'>Notifications</span>
                            {badgeVisible && unreadCount > 0 && 
							( // displaying badge count only if visible and count > 0
                                <span className='absolute -top-1 right-45 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    </li>
                    <li className='flex justify-center md:justify-start'>
                        <Link
                            to={`/profile/${authUser?.username}`}
                            className='flex gap-3 items-center hover:bg-stone-800 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
                        >
                            <FaUser className='w-6 h-6' />
                            <span className='text-lg hidden md:block'>Profile</span>
                        </Link>
                    </li>
                </ul>
                {authUser && 
				(
                    <Link
                        to={`/profile/${authUser.username}`}
                        className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full'
                    >
                        <div className='avatar hidden md:inline-flex'>
                            <div className='w-8 rounded-full'>
                                <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
                            </div>
                        </div>
                        <div className='flex justify-between flex-1'>
                            <div className='hidden md:block'>
                                <p className='text-white font-bold text-sm w-20 truncate'>{authUser?.fullName}</p>
                                <p className='text-slate-500 text-sm'>@{authUser?.username}</p>
                            </div>
                            <CgLogOut
                                className='w-5 h-5 cursor-pointer'
                                onClick={(e) => 
								{
                                    e.preventDefault();
                                    logout();
                                }}
                            />
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
