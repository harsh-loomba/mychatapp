import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { ChatContext } from "../context/ChatContext";

const Chats = () => {
	const [chats, setChats] = useState([]);

	const { currentUser } = useContext(AuthContext);
	const { dispatch } = useContext(ChatContext);

	useEffect(() => {
		const getChats = () => {
			const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
				setChats(doc.data());
			});

			return () => {
				unsub();
			};
		};

		currentUser.uid && getChats();
	}, [currentUser.uid]);

	const handleSelect = (u) => {
		dispatch({ type: "CHANGE_USER", payload: u });
	};

	const formatDateTime = (timestamp) => {
		const date = timestamp.toDate();
		const now = new Date();

		if (
			date.getMonth() === now.getMonth() &&
			date.getFullYear() === now.getFullYear()
		) {
			// Display time in "hh:mm" format
			if (date.getDate() === now.getDate()) {
				return date.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				});
			} else if (date.getDate() === now.getDate() - 1) {
				return "Yesterday";
			}
		}
		// Display date in "DD:MM:YY" format
		return date.toLocaleDateString(undefined, {
			day: "2-digit",
			month: "2-digit",
			year: "2-digit",
		});
	};

	return (
		<div className="chats">
			{Object.entries(chats)
				?.sort((a, b) => b[1].date - a[1].date)
				.map((chat) => (
					<div
						className="userChat"
						key={chat[0]}
						onClick={() => handleSelect(chat[1].userInfo)}
					>
						<img src={chat[1].userInfo.photoURL} alt="" />
						<div className="userChatInfo">
							<span>{chat[1].userInfo.displayName}</span>
							<div className="userChatMsgInfo">
								<div className="msg">
									{chat[1].lastMessage?.text.substring(0, 35)}
								</div>
								<div className="date">
									{chat[1].date && formatDateTime(chat[1].date)}
								</div>
							</div>
						</div>
					</div>
				))}
		</div>
	);
};

export default Chats;
