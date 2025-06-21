import client from "../services/restClient";


const initState = {
  user: null,
  isLoggedIn: false,
  isAuthLoading: true,
};

export const auth = {
  state: {
    ...initState,
  },
  reducers: {
    // handle state changes with pure functions
    update(state, newState) {
      return { ...state, ...newState };
    },
  },
  effects: (dispatch) => ({
    //////////////////
    //// GET USER ////
    //////////////////
    async getUser(_, reduxState) {
      return new Promise(async (resolve, reject) => {
        try {
          const { user } = reduxState.auth;
          let _user = await client.service("users").get(user._id);
          this.update({ user: _user });
          resolve();
        } catch (error) {
          console.log("Failed to get user", { error });
          dispatch.toast.alert({
            type: "error",
            title: "Get user",
            message: error.message || "Failed to get user",
          });
          reject(error);
        }
      });
    },
    ///////////////
    //// LOGIN //// using feathers rest client
    ///////////////
    async login(data, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        try {
          let loginResponse = await client.authenticate({
            ...data,
            strategy: "local",
          });
          if (!loginResponse?.user?.status) {
            this.update({ isLoggedIn: false });
            dispatch.toast.alert({
              type: "error",
              message: "Invalid Login.",
            });
            resolve(loginResponse);
          } else {
            // await _setLoginEmail(data.email, loginResponse?.accessToken);
            this.update({ isLoggedIn: true, user: loginResponse.user });
            resolve(loginResponse);
          }
        } catch (error) {
          console.log("error", { error });
          reject(error);
        }
        dispatch.loading.hide();
      });
    },
    //////////////////////////
    //// LOGIN FOR O AUTH ////
    //////////////////////////
    async loginForOAuth(data, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        try {
          let loginResponse = await client.authenticate({
            ...data,
            strategy: "local",
          });
          this.update({ isLoggedIn: true, user: loginResponse.user });
          resolve();
        } catch (error) {
          reject(error);
        }
        dispatch.loading.hide();
      });
    },
    /////////////////////////
    //// RE-AUTHENTICATE ////
    /////////////////////////
    async reAuth(data, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        try {
          let loginResponse = await client.reAuthenticate();
          console.log('reAuth result:', loginResponse);

          // Fetch user if not present in loginResponse
          let user = loginResponse.user;
          if (!user && loginResponse.payload && loginResponse.payload.sub) {
            user = await client.service("users").get(loginResponse.payload.sub);
          }

          if (!user || user.status === false) {
            this.update({ isLoggedIn: false, user, isAuthLoading: false });
            dispatch.toast.alert({
              type: "error",
              message: "login was denied, please contact admin.",
            });
          } else {
            this.update({ isLoggedIn: true, user, isAuthLoading: false });
          }
          resolve();
        } catch (error) {
          console.log("reAuth error", error);
          this.update({ isLoggedIn: false, user: null, isAuthLoading: false });
          reject(error);
        }
        dispatch.loading.hide();
      });
    },
    ////////////////
    //// LOGOUT ////
    ////////////////
    async logout(_, reduxState) {
      dispatch.loading.show();
      const { user } = reduxState.auth;
      try {
        // First try to logout from the server
        await client.logout();
        
        // Clear all storage
        window.localStorage.clear();
        window.sessionStorage.clear();
        
        // Reset the client authentication
        client.set('accessToken', null);
        
        // Update the state
        this.update(initState);
        
        // Show success message
        dispatch.toast.alert({
          title: "Authenticator",
          type: "success",
          message: `${user?.name} logged out successfully!`,
        });
        
        // Force reload the page to clear any remaining state
        window.location.href = '/login';
      } catch (error) {
        console.log("Logout error:", error);
        // Even if there's an error, we should still clear everything
        window.localStorage.clear();
        window.sessionStorage.clear();
        client.set('accessToken', null);
        this.update(initState);
        window.location.href = '/login';
      }
      dispatch.loading.hide();
    },

    //////////////////////
    //// CREATE USER /////
    //////////////////////
    async createUser(data, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        try {
          // Ensure data is properly formatted
          const userData = {
            name: data.name?.trim(),
            email: data.email?.toLowerCase().trim(),
            password: data.password,
            status: true
          };

          // Validate required fields
          if (!userData.name || !userData.email || !userData.password) {
            throw new Error('Please fill in all required fields');
          }

          // Create the user
          const result = await client.service("users").create(userData);
          
          // Show success message
          dispatch.toast.alert({
            type: "success",
            title: "Sign Up",
            message: "Account created successfully!",
          });

          resolve(result);
        } catch (error) {
          console.log("Signup error:", error);
          
          // Handle specific error cases
          let errorMessage = "Failed to sign up";
          if (error.code === 11000) {
            errorMessage = "This email is already registered";
          } else if (error.message) {
            errorMessage = error.message;
          }

          dispatch.toast.alert({
            type: "error",
            title: "Sign Up Failed",
            message: errorMessage
          });
          reject(error);
        }
        dispatch.loading.hide();
      });
    },
    ///////////////////////////////
    //// CREATE USER FOR O AUTH ////
    ////////////////////////////////
    async createUserForOauth(data, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        try {
          const results = await client.service("users").create(data);
          const userProfileData = {
            userId: results._id,
            imageUrl: data.imageUrl,
            uId: data.uId,
            provider: data.provider,
          };

          await client.service("usersProfile").create(userProfileData);
          dispatch.toast.alert({
            type: "success",
            title: "Sign Up",
            message: "Successful",
          });
          resolve();
        } catch (error) {
          console.log("error", { error });
          dispatch.toast.alert({
            type: "error",
            title: "Sign Up",
            message: "You are already signed in!",
          });
          reject(error);
        }
        dispatch.loading.hide();
      });
    },
    ////////////////////
    //// PATCH USER ////
    ////////////////////
    async patchUser({ _id, data }, reduxState) {
      return new Promise(async (resolve, reject) => {
        if (!_id) {
          dispatch.toast.alert({
            type: "error",
            message: "User id is required",
          });
          reject("User id is required");
          return;
        }
        console.log(_id, data)
        await client
          .service("users")
          .patch(_id, data)
          .then((user) => {
            console.log(user);
            this.update({ user });
            dispatch.toast.alert({
              type: "success",
              title: "Password Reset",
              message: "Successful",
            });
            resolve(user);
          })
          .catch((e) => {
            console.log("errrrrrr>>>>>", e);
            dispatch.toast.alert({
              type: "error",
              title: "Password Reset",
              message: "Failed" + e,
            });
            reject(e);
          });
      });
    },
    /////////////////////////
    //// CHANGE PASSWORD ////
    /////////////////////////
    async changeUserPassword({ oldPassword, newPassword }, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        await client
          .service("users")
          .patch(reduxState.auth.user._id, {
            oldPassword,
            newPassword,
            changePassword: true,
            clientName: "codebridge-website",
          })
          .then((res) => {
            dispatch.toast.alert({
              type: "success",
              title: "Password",
              message: "User password updated successfully!",
            });
            resolve();
          })
          .catch((err) => {
            console.log("Failed to update user password", err);
            dispatch.toast.alert({
              type: "error",
              title: "Password",
              message: err.message || "Failed to update user password",
            });
            this.update({
              passwordPolicyErrors: Array.isArray(err.data) ? err.data : [],
            });
            reject(err);
          });

        dispatch.loading.hide();
      });
    },
  }),
};
