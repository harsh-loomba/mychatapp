import React, { useState } from "react";
import Add from "../img/addAvatar.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
	const [err, setErr] = useState(false);
	const navigate = useNavigate();

	const [isImageSelected, setIsImageSelected] = useState("image-not-selected"); // State to track if an image is selected

	const handleSubmit = async (e) => {
		e.preventDefault();

		const displayName = e.target[0].value;
		const email = e.target[1].value;
		const password = e.target[2].value;
		const file = e.target[3].files[0];

		try {
			const res = await createUserWithEmailAndPassword(auth, email, password);

			const storageRef = ref(storage, res.user.uid);

			await uploadBytesResumable(storageRef, file).then(() => {
				getDownloadURL(storageRef).then(
					async (downloadURL) => {
						try {
							await updateProfile(res.user, {
								displayName: displayName,
								photoURL: downloadURL,
							});

							await setDoc(doc(db, "users", res.user.uid), {
								uid: res.user.uid,
								displayName: displayName,
								email: email,
								photoURL: downloadURL,
							});

							await setDoc(doc(db, "userChats", res.user.uid), {});

							navigate("/");
						} catch (error) {
							setErr(true);
							console.log(error);
						}
					},

					(error) => {
						setErr(true);
					}
				);
			});
		} catch (err) {
			setErr(true);
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
	};

	const removeImageSelect = () => {
		setIsImageSelected("image-not-selected");
	};

	return (
		<div className="formContainer">
			<div className="formWrapper">
				<span className="logo">My Chat</span>
				<span className="title">Register</span>
				<form onSubmit={handleSubmit}>
					<input type="text" placeholder="Display Name" required />
					<input type="email" placeholder="Email" required />
					<input type="password" placeholder="Password" required />
					<input
						style={{ display: "none" }}
						type="file"
						id="file"
						onChange={handleImageSelect}
						onClick={removeImageSelect}
						required
					/>
					<label htmlFor="file">
						<img src={Add} alt="" className={isImageSelected} />
						<span>
							{isImageSelected === "image-not-selected"
								? "Upload Profile Image"
								: "Profile Image Selected"}
						</span>
					</label>
					<button>Register</button>
					{err && <span>Something went wrong</span>}
				</form>

				<p>
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</div>
		</div>
	);
};

export default Register;
