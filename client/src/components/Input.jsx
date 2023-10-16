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
import Resizer from "react-image-file-resizer";

const Input = () => {
	const [text, setText] = useState("");
	const [dispText, setDispText] = useState("");
	const [img, setImg] = useState(null);
	const [isImageSelected, setIsImageSelected] = useState("image-not-selected"); // State to track if an image is selected

	const { currentUser } = useContext(AuthContext);
	const { data } = useContext(ChatContext);

	const resizeFileCustom = (file, maxl, quality, type) =>
		new Promise((resolve) => {
			Resizer.imageFileResizer(
				file,
				maxl,
				maxl,
				type,
				quality,
				0,
				(uri) => {
					resolve(uri);
				},
				"file"
			);
		});

	const resizeFile = async (file) => {
		var quality = 100;
		var maxl = 1920;
		var imgg = file;
		var type = file.type;

		console.log(type);

		if (type === "image/png") {
			type = "PNG";
		} else if (type === "image/webp") {
			type = "webp";
		} else {
			type = "JPEG";
		}

		if (type === "JPEG") {
			while (file.size >= 1572864 && quality >= 50) {
				imgg = await resizeFileCustom(imgg, maxl, quality, type);
				quality -= 5;
			}
			quality = 50;
		}

		while (file.size >= 1572864 && maxl >= 720) {
			imgg = await resizeFileCustom(imgg, maxl, quality, type);
			maxl -= 84;
		}

		return imgg;
	};

	const handleSend = async () => {
		setDispText("");

		if (img) {
			const storageRef = ref(storage, uuid());

			const file = await resizeFile(img);

			await uploadBytesResumable(storageRef, file).then(() => {
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
						console.log(error);
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
					accept="image/*"
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
