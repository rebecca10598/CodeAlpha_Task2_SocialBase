export const POSTS = [
	{
		_id: "1",
		text: "Having Lunch 😍",
		img: "/posts/post1.png",
		user: {
			username: "RC",
			profileImg: "/avatars/boy1.png",
			fullName: "Richard Castle",
		},
		comments: [
			{
				_id: "1",
				text: "Nice",
				user: {
					username: "janedoe",
					profileImg: "/avatars/girl1.png",
					fullName: "Jane Doe",
				},
			},
		],
		likes: ["6658s891", "6658s892", "6658s893", "6658s894"],
	},
	{
		_id: "2",
		text: "How you guys doing? 😊",
		user: {
			username: "johndoe",
			profileImg: "/avatars/boy2.png",
			fullName: "John Doe",
		},
		comments: [
			{
				_id: "1",
				text: "Nice Tutorial",
				user: {
					username: "janedoe",
					profileImg: "/avatars/girl2.png",
					fullName: "Jane Doe",
				},
			},
		],
		likes: ["6658s891", "6658s892", "6658s893", "6658s894"],
	},
	{
		_id: "3",
		text: "Dream of becoming an Astronaut 🚀",
		img: "/posts/post2.png",
		user: {
			username: "johndoe",
			profileImg: "/avatars/boy3.png",
			fullName: "John Doe",
		},
		comments: [],
		likes: ["6658s891", "6658s892", "6658s893", "6658s894", "6658s895", "6658s896"],
	},
	{
		_id: "4",
		text: "I'm learning GO this week. Any tips? 🤔",
		img: "/posts/post3.png",
		user: {
			username: "johndoe",
			profileImg: "/avatars/boy3.png",
			fullName: "John Doe",
		},
		comments: [
			{
				_id: "1",
				text: "Nice Tutorial",
				user: {
					username: "janedoe",
					profileImg: "/avatars/girl3.png",
					fullName: "Jane Doe",
				},
			},
		],
		likes: [
			"6658s891",
			"6658s892",
			"6658s893",
			"6658s894",
			"6658s895",
			"6658s896",
			"6658s897",
			"6658s898",
			"6658s899",
		],
	},
];

export const USERS_FOR_RIGHT_PANEL = [
	{
		_id: "1",
		fullName: "Kate Beckett",
		username: "kb",
		profileImg: "/avatars/boy1.png",
	},
	{
		_id: "2",
		fullName: "Richard Castle",
		username: "rc",
		profileImg: "/avatars/girl2.png",
	},
	{
		_id: "3",
		fullName: "Martha Stewart",
		username: "ms",
		profileImg: "/avatars/boy2.png",
	},
	{
		_id: "4",
		fullName: "Lanie Thompson",
		username: "lanieth",
		profileImg: "/avatars/girl3.png",
	},
];