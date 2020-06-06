import React from "react";
import database from "../../firebase/firebase";
import { Table, Container } from "react-bootstrap";
import axios from "axios";

class AdminMapping extends React.Component {
  state = {
    boothId: "",
    booths: [],
  };

  async componentDidMount() {
    try {
      const snapshot = await database.ref("admin").once("value");
      const booths = [];
      snapshot.forEach((child) => {
        booths.push({
          adminId: child.key,
          boothId: child.val().boothId,
        });
      });
      this.setState({ booths });
    } catch (e) {
      console.log(e);
      if (e.response && e.response.data) {
        alert(e.response.data.message);
      } else {
        alert("Something went wrong!");
      }
    }
  }

  generateBooth = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/generateId`, {
        boothId: this.state.boothId,
        adminToken: "QXNodXRvc2gsU2luZ2g=",
      });
      const user = response.data.user;

      this.setState({
        booths: [user, ...this.state.booths],
        boothId: "",
      });
      console.log({
        booths: [user, ...this.state.booths],
        boothId: "",
      });
    } catch (e) {
      console.log(e);
      if (e.response && e.response.data) {
        alert(e.response.data.message);
      } else {
        alert("Something went wrong!");
      }
    }
  };
  render() {
    const { users, selectedUser } = this.state;
    const { isAdmin } = this.props;
    console.log(users, selectedUser);

    if (!isAdmin) {
      return <p>Page not found</p>;
    }
    return (
      <Container>
        <form className="my-5" onSubmit={this.generateBooth}>
          <div className="form-group">
            <label>Enter Booth Id</label>
            <input
              className="form-control"
              value={this.state.boothId}
              onChange={(e) => this.setState({ boothId: e.target.value })}
            />
          </div>
          <div className="form-group">
            <button className="btn btn-warning" disabled={!this.state.boothId}>
              Generate Admin Id
            </button>
          </div>
        </form>
        <Table responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Booth Id</th>
              <th>Admin Id</th>
            </tr>
          </thead>
          <tbody>
            {this.state.booths.map(({ boothId, adminId }, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{boothId}</td>
                <td>{adminId}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    );
  }
}

AdminMapping.getInitialProps = async ({ router }) => {
  const obj = {};
  const adminToken = router.query["admin-mapping"];

  if (adminToken === process.env.adminMapperToken) {
    obj.isAdmin = true;
  }
  return obj;
};

export default AdminMapping;
