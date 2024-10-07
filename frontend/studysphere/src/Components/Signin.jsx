// import React, { useState } from "react";
// import axios from "axios";

// const SignIn = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "User",
//   });

//   const { name, email, password, role } = formData;

//   const onChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("/api/users/register", formData);
//       console.log(res.data); // You will get authToken and user data
//       // Store token in local storage or session
//       localStorage.setItem("authToken", res.data.authToken);
//       alert("User registered successfully!");
//     } catch (error) {
//       console.error(error.response.data);
//       alert("Error registering user");
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={onSubmit}>
//         <div>
//           <label>Name</label>
//           <input
//             type="text"
//             name="name"
//             value={name}
//             onChange={onChange}
//             required
//           />
//         </div>
//         <div>
//           <label>Email</label>
//           <input
//             type="email"
//             name="email"
//             value={email}
//             onChange={onChange}
//             required
//           />
//         </div>
//         <div>
//           <label>Password</label>
//           <input
//             type="password"
//             name="password"
//             value={password}
//             onChange={onChange}
//             required
//           />
//         </div>
//         <div>
//           <label>Role</label>
//           <select name="role" value={role} onChange={onChange}>
//             <option value="User">User</option>
//             <option value="Admin">Admin</option>
//           </select>
//         </div>
//         <button type="submit">Register</button>
//       </form>
//     </div>
//   );
// };

// export default SignIn;


import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (password !== confirmPassword) {
    //   setError('Passwords do not match!');
    //   return;
    // }

    try {
      await axios.post('http://localhost:5000/api/users/register', { name, email, password });
      navigate('/login');
    } catch (error) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-5 text-center">Signup</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 mb-3 border border-gray-300 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 mb-3 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 mb-3 border border-gray-300 rounded"
        />
        {/* <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full p-2 mb-5 border border-gray-300 rounded"
        /> */}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Signup
        </button>
      </form>
    </div>
  );
}

export default Signup;