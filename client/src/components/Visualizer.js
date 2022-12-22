import { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import Header from "./Header";
import $ from "jquery";
import { useNavigate, useSearchParams } from "react-router-dom";

// Component for the visualizer
const Visualizer = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [params, setParams] = useSearchParams();
  const [user, setUser] = useState();
  const [affiliation, setAffiliation] = useState();
  const navigate = useNavigate();

  // Get the user, his friends and their information
  useEffect(() => {
    const currUser = params.get("user");
    const currAffiliation = params.get("affiliation");
    setAffiliation(currAffiliation);
    setUser(currUser);

    if (currUser !== "") {
      $.post(
        "http://localhost:3000/getFriends",
        { username: currUser },
        (friend_data, status) => {
          const nodes_array = [];
          const edges_array = [];
          nodes_array.push({ id: currUser, label: currUser });
          friend_data.forEach((elem) => {
            nodes_array.push({ id: elem.receiver.S, label: elem.receiver.S });
            edges_array.push({ from: elem.sender.S, to: elem.receiver.S });
          });
          setNodes(nodes_array);
          setEdges(edges_array);
        }
      );
    } else {
      navigate("/");
    }
  }, []);

  const options = {
    edges: {
      color: "#000000",
    },
    height: "500px",
  };

  // On click, you should expand a node by checking their affiliation
  const expand = (username) => {
    $.post(
      "http://localhost:3000/getFriends",
      { username },
      (friend_data, status) => {
        const nodes_array = [];
        const edges_array = [];
        const promises = [];

        friend_data.forEach((elem) => {
          promises.push(
            $.post(
              "http://localhost:3000/getWallInformation",
              { user: elem.receiver.S },
              (friend_affiliation, status) => {
                if (friend_affiliation.affiliation == affiliation) {
                  nodes_array.push({
                    id: elem.receiver.S,
                    label: elem.receiver.S,
                  });
                  edges_array.push({
                    from: elem.sender.S,
                    to: elem.receiver.S,
                  });
                }
              }
            )
          );
        });
        Promise.all(promises).then((values) => {
          setNodes(nodes.concat(nodes_array));
          setEdges(edges.concat(edges_array));
        });
      }
    );
  };

  const events = {
    selectNode: function (event) {
      expand(event.nodes[0]);
    },
  };
  return (
    <>
      <Header></Header>
      <h3 className="text-center">Click on nodes to expand them</h3>
      <Graph
        graph={{ nodes, edges }}
        options={options}
        events={events}
        getNetwork={(network) => {}}
      />
    </>
  );
};

export default Visualizer;
