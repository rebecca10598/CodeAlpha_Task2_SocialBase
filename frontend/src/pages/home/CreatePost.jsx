import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import EmojiPicker from "emoji-picker-react"; 

const CreatePost = () => 
{
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const imgRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    const queryClient = useQueryClient();

    const { mutate: createPost, isPending, isError, error } = useMutation({
        mutationFn: async ({ text, img }) => 
		{
            try 
			{
                const res = await fetch("/api/posts/create", 
				{
                    method: "POST",
                    headers: 
					{
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text, img }),
                });
                const data = await res.json();
                if (!res.ok) 
				{
                    throw new Error(data.error || "Something went wrong");
                }
                return data;
            } 
			catch (error) 
			{
                throw new Error(error);
            }
        },
        onSuccess: () => 
		{
            setText("");
            setImg(null);
            toast.success("Post successfully created");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

    const handleSubmit = (e) => 
	{
        e.preventDefault();
        createPost({ text, img });
    };

    const handleImgChange = (e) => 
	{
        const file = e.target.files[0];
        if (file) 
		{
            const reader = new FileReader();
            reader.onload = () => 
			{
                setImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // function to handle emoji clicks
    const handleEmojiClick = (emojiObject) => 
	{
        setText(prevText => prevText + emojiObject.emoji);
        setShowEmojiPicker(false); // hide emoji picker after the selection
    };

    return (
        <div className='flex p-4 items-start gap-4 border-b border-gray-700'>
            <div className='avatar'>
                <div className='w-8 rounded-full'>
                    <img src={authUser.profileImg || "/avatar-placeholder.png"} alt="Profile" />
                </div>
            </div>
            <form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
                <textarea
                    className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800'
                    placeholder='Let everyone know what is up with you...'
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                {img && (
                    <div className='relative w-72 mx-auto'>
                        <IoCloseSharp
                            className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
                            onClick={() => {
                                setImg(null);
                                imgRef.current.value = null;
                            }}
                        />
                        <img src={img} className='w-full mx-auto h-72 object-contain rounded' alt="Uploaded" />
                    </div>
                )}

                <div className='flex justify-between border-t py-2 border-t-gray-700'>
                    <div className='flex gap-1 items-center'>
                        <CiImageOn
                            className='text-pink-500 w-6 h-6 cursor-pointer'
                            onClick={() => imgRef.current.click()}
                        />
                        <BsEmojiSmileFill
                            className='text-pink-500 w-5 h-5 cursor-pointer'
                            onClick={() => setShowEmojiPicker(prev => !prev)}
                        />
                    </div>
                    {showEmojiPicker && (
                        <div className="absolute bottom-12 left-0 z-10">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}
                    <input type='file' accept='image/*' hidden ref={imgRef} onChange={handleImgChange} />
                    <button className='btn bg-pink-500 rounded-full btn-sm text-white px-4'>
                        {isPending ? "Posting..." : "Post"}
                    </button>
                </div>
                {isError && <div className='text-red-500'>{error.message}</div>}
            </form>
        </div>
    );
};

export default CreatePost;
