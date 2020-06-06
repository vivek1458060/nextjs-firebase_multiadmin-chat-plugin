import React from "react";
import { ListGroup, Badge } from "react-bootstrap";
import database from "../../firebase/firebase";
import ChatBox from "../../component/chatbox/ChatBox";
import Router from "next/router";
import VerifyAdminId from "../../utils/verifyAdminToken";

class AdminChat extends React.Component {
  state = {
    users: [],
    isOpen: false,
    selectedUser: undefined,
  };

  subscribeMessage = (boothId) => {
    database
      .ref(`${boothId}`)
      .limitToLast(1)
      .on("child_changed", (snapshot) => {
        console.log("new message............");
        const messages = this.converObjToArray(snapshot.val().messages);
        const newUser = {
          id: snapshot.key,
          ...snapshot.val(),
          messages,
        };

        this.setState({
          users: this.state.users.map((user) => {
            if (user.id === snapshot.key) {
              return newUser;
            }
            return user;
          }),
          selectedUser: newUser,
        });
      });
  };

  subscribeUser = (boothId) => {
    database
      .ref(`${boothId}`)
      .limitToLast(1)
      .on("child_added", (snapshot) => {
        const userExist = this.state.users.some(
          (user) => user.id === snapshot.key
        );

        if (!userExist) {
          const messages = this.converObjToArray(snapshot.val().messages);
          const user = {
            id: snapshot.key,
            ...snapshot.val(),
            messages,
          };
          this.setState({
            users: [...this.state.users, user],
          });
        }
      });
  };

  converObjToArray(obj) {
    const arr = [];
    for (let key in obj) {
      arr.push({
        id: key,
        ...obj[key],
      });
    }
    return arr;
  }

  async componentDidMount() {
    try {
      const boothId = Router.router.query.boothId;

      const usersSnapshot = await database
        .ref(`${boothId}`)
        .orderByChild("resolved")
        .equalTo(false)
        .once("value");

      const users = [];
      usersSnapshot.forEach((childSnapshot) => {
        const messagesObj = childSnapshot.val().messages;
        const messages = this.converObjToArray(messagesObj);
        users.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
          messages,
        });
      });

      this.setState({ users });
      this.subscribeUser(boothId);
      this.subscribeMessage(boothId);
    } catch (e) {
      console.log(e);
      alert("Something went wrong!");
    }
  }

  selectUser = (id) => {
    const userIndex = this.state.users.findIndex((user) => user.id === id);
    this.setState({ selectedUser: this.state.users[userIndex], isOpen: true });
  };

  openMsgbox = () => {
    if (!this.state.selectedUser) return;
    if (this.state.isOpen) {
      this.setState({ selectedUser: undefined });
    }
    this.setState({ isOpen: !this.state.isOpen });
  };
  sendMsg = async (msg) => {
    const boothId = Router.router.query.boothId;
    const adminId = Router.router.query["adminId"];
    const selectedUser = this.state.selectedUser;
    if (!selectedUser) return;
    try {
      await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          msg,
          userId: selectedUser.id,
          adminId,
          boothId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      console.log(e);
      alert("Something went wrong!");
    }
  };
  // markAsResolve = async (e, id) => {
  //   e.stopPropagation();
  //   if (!confirm("Are you sure!")) return;

  //   const { selectedUser, users } = this.state;

  //   const isSelectedUserAction = selectedUser && selectedUser.id === id;
  //   let user;
  //   if (isSelectedUserAction) {
  //     user = selectedUser;
  //   } else {
  //     const index = users.findIndex((user) => user.id === id);
  //     user = users[index];
  //   }
  //   try {
  //     await fetch("/api/chat", {
  //       method: "PATCH",
  //       body: JSON.stringify({
  //         uid: user.id,
  //         adminToken: "QXNodXRvc2gsU2luZ2g=",
  //       }),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     if (isSelectedUserAction) {
  //       this.setState({ isOpen: false, selectedUser: undefined });
  //     }
  //     this.setState({
  //       users: users.filter((user) => user.id !== id),
  //     });
  //   } catch (e) {
  //     console.log(e);
  //     alert("Something went wrong!");
  //   }
  // };
  render() {
    const { users, selectedUser } = this.state;
    const { isAdmin } = this.props;

    if (!isAdmin) {
      return <p>Page not found</p>;
    }
    return (
      <div className="container my-5" style={{ maxWidth: "500px" }}>
        <h2 style={{ fontWeight: 200 }} className="mb-4 ">
          Messages
        </h2>
        <ListGroup>
          {users.map(({ messages, id }) => (
            <ListGroup.Item
              action
              variant={selectedUser && selectedUser.id === id ? "primary" : ""}
              key={id}
              onClick={() => this.selectUser(id)}
            >
              <div className="d-flex justify-content-between">
                <span>{id}</span>
                {/* <span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => this.markAsResolve(e, id)}
                  >
                    Mark as Resolve
                  </button>
                </span> */}
              </div>
              {messages[messages.length - 1].text}
            </ListGroup.Item>
          ))}
        </ListGroup>
        <ChatBox
          isOpen={this.state.isOpen}
          messages={selectedUser ? selectedUser.messages : []}
          isAdmin={isAdmin}
          openMsgbox={this.openMsgbox}
          sendMsg={this.sendMsg}
        />
      </div>
    );
  }
}

AdminChat.getInitialProps = async ({ router }) => {
  try {
    const boothId = router.query["boothId"];
    const adminId = router.query["adminId"];

    await VerifyAdminId(boothId, adminId);

    return { isAdmin: true };
  } catch (e) {
    console.log(e);
    return {};
  }
};

export default AdminChat;
