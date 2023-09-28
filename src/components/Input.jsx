import React, { useContext, useState } from "react";
import Img from "../img/img.png";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
	Timestamp,
	arrayUnion,
	doc,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const Input = () => {
	const [text, setText] = useState("");
	const [dispText, setDispText] = useState("");
	const [img, setImg] = useState(null);
	const [isImageSelected, setIsImageSelected] = useState("image-not-selected"); // State to track if an image is selected

	const { currentUser } = useContext(AuthContext);
	const { data } = useContext(ChatContext);

	const handleSend = async () => {
		setDispText("");

		if (img) {
			const storageRef = ref(storage, uuid());

			await uploadBytesResumable(storageRef, img).then(() => {
				getDownloadURL(storageRef).then(
					async (downloadURL) => {
						await updateDoc(doc(db, "chats", data.chatId), {
							messages: arrayUnion({
								id: uuid(),
								text,
								senderId: currentUser.uid,
								date: Timestamp.now(),
								img: downloadURL,
							}),
						});
					},

					(error) => {
						// setErr(true);
					}
				);
			});
		} else {
			if (text === "") {
				return;
			}

			await updateDoc(doc(db, "chats", data.chatId), {
				messages: arrayUnion({
					id: uuid(),
					text,
					senderId: currentUser.uid,
					date: Timestamp.now(),
				}),
			});
		}

		await updateDoc(doc(db, "userChats", currentUser.uid), {
			[data.chatId + ".lastMessage"]: { text },
			[data.chatId + ".date"]: serverTimestamp(),
		});

		await updateDoc(doc(db, "userChats", data.user.uid), {
			[data.chatId + ".lastMessage"]: { text },
			[data.chatId + ".date"]: serverTimestamp(),
		});

		setText("");
		setImg(null);
		setIsImageSelected("image-not-selected");
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleSend();
		}
	};

	// Function to handle image selection
	const handleImageSelect = (e) => {
		const selectedImage = e.target.files[0];
		if (selectedImage) {
			setIsImageSelected("image-selected");
		} else {
			setIsImageSelected("image-not-selected");
		}
		setImg(selectedImage);
	};

	const removeImageSelect = () => {
		setIsImageSelected("image-not-selected");
		setImg(null);
	};

	return (
		<div className="input">
			<input
				type="text"
				placeholder="Type something..."
				onChange={(e) => {
					setDispText(e.target.value);
					setText(e.target.value.trim());
				}}
				value={dispText}
				onKeyDown={handleKeyPress}
			/>
			<div className="send">
				{/* <img src={Attach} alt="" /> */}
				<input
					type="file"
					style={{ display: "none" }}
					id="file"
					onChange={handleImageSelect}
					onClick={removeImageSelect}
				/>
				<label htmlFor="file">
					<img
						src={Img}
						alt=""
						id="imgimg"
						className={isImageSelected} // Apply the CSS class
					/>
				</label>
				<button onClick={handleSend}>Send</button>
			</div>
		</div>
	);
};

export default Input;
