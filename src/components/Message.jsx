import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Message = ({ message }) => {
	const { currentUser } = useContext(AuthContext);
	const { data } = useContext(ChatContext);

	const formatDate = (timestamp) => {
		const date = timestamp.toDate();
		return date.toLocaleDateString(undefined, {
			day: "2-digit",
			month: "2-digit",
			year: "2-digit",
		});
	};

	const formatTime = (timestamp) => {
		const date = timestamp.toDate();
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div
			className={`message ${message.senderId === currentUser.uid && "owner"}`}
		>
			<div className="messageInfo">
				<img
					src={
						message.senderId === currentUser.uid
							? currentUser.photoURL
							: data.user.photoURL
					}
					alt=""
				/>
				<span>{message.date && formatDate(message.date)}</span>
				<span>{message.date && formatTime(message.date)}</span>
			</div>
			<div className="messageContent">
				{message.text !== "" && <p>{message.text}</p>}
				{message.img && <img src={message.img} alt="" />}
			</div>
		</div>
	);
};

export default Message;
