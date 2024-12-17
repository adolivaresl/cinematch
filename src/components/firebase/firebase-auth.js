import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getAuth,  signOut, updateProfile } from "firebase/auth";

export const userOut = (navigate) => {
  const auth = getAuth();
signOut(auth).then(() => {
  console.log('Te deslogueaste')
  navigate('/login');
}).catch((error) => {
  console.error(error);
});
}

export const registerUser = (auth, email, password, name, navigate) => {
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    //localStorage.setItem('name', JSON.stringify(name))
    if(auth.currentUser.displayName == null){
      updateProfile(auth.currentUser, {
        displayName: name,
      }).then(() => {
        console.log('usuario actualizado')
      }).catch((error) => {
        console.log(error)
      });
    }
    userOut();
    navigate('/login');
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(errorCode,errorMessage )
    // ..
  });
}

export const loginUser = (auth, email, password, navigate) => {
    signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    //const user = userCredential.user;
    // window.location.href = '/catalog';
    navigate('/catalog');
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(errorCode,errorMessage )
  });
}



export const signinGoogle = (auth, navigate) => {
  console.log(3,  'escucho el click')
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
  .then(result => {
    // console.log(4,  result)
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    console.log(5, credential, token, user)
    navigate('/catalog');
      // window.location.href = '/catalog';
  }).catch((error) => {
    // Handle Errors here.
    const errorMessage = error.message;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    console.log(errorMessage, credential)
  });

}