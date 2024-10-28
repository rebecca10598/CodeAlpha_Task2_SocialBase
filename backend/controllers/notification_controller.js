import Notification from "../models/notification_model.js";

export const getNotifications = async (req, res) => 
{
    try 
    {
        const userId = req.user._id;

        const notifications = await Notification
            .find({ to: userId })
            .populate({
                path: "from",
                select: "username profileImg",
            })
            .populate({
                path: "postId", // if you want to fetch post details as well
                select: "title", // add fields you want
            });

        // mark notifications as read
        await Notification.updateMany(
            { to: userId, read: false },
            { read: true }
        );

        res.status(200).json(notifications);
    } 
    catch (error) 
    {
        console.log("There is an error in getNotifications function", error.message);
        res.status(500).json({ error: `There is an internal server error: ${error.message}` });
    }
};

// delete notifications for the current user
export const deleteNotifications = async (req, res) => 
{
	try 
    {
		const userId = req.user._id;

		const { deletedCount } = await Notification
        .deleteMany({ to: userId }); // delete notifications for the user

		if (deletedCount === 0) 
        {
			return res.status(404).json({ message: "No notifications found to delete" });
		}

		res.status(200).json({ message: `${deletedCount} notifications have been successfully deleted` });
	} 
    catch (error) 
    {
		console.error("There is an error in deleteNotifications:", error.message);
		res.status(500).json({ error: `There is an internal server error: ${error.message}` });
	}
};

// getting count of unread notifications for the current user
export const getUnreadNotificationsCount = async (req, res) => 
{
	try 
    {
		const userId = req.user._id; // get user ID from request

		const count = await Notification.countDocuments
        ({
			to: userId,
			read: false, // count only unread notifications
		});

		res.status(200).json({ count }); // return the count
	} 
    catch (error) 
    {
		console.error("Error fetching unread notifications count:", error.message);
		res.status(500).json({ error: `Internal server error: ${error.message}` });
	}
};
