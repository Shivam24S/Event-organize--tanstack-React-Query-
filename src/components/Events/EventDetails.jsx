import { Link, Outlet } from "react-router-dom";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";

import Header from "../Header.jsx";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const params = useParams();

  const navigate = useNavigate();

  const { data, isError, isPending, error } = useQuery({
    queryKey: ["event", { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const {
    mutate,
    isPending: deletionPending,
    isError: deletionError,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["event"],
        // it will not refetch immediately after delete data
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const handleStartDelete = () => {
    setIsDeleting(true);
  };
  const handleStopDelete = () => {
    setIsDeleting(false);
  };

  const handleDelete = () => {
    mutate({ id: params.id });
  };

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content">
        <p style={{ textAlign: "center" }}>Fetching Event Data....</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content">
        <ErrorBlock
          title="could't able to load Data"
          message={error.info?.message || "can't able to load Data"}
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time>
                  {" "}
                  {formattedDate} @{data.time}
                </time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <>
          <Modal onClose={handleStopDelete}>
            <h2>Are you sure ?</h2>
            <p>Do you really want to delete this event ?</p>
            <div className="form-actions">
              {deletionPending && <p>Deleting, please Wait..</p>}
              {deletionError && (
                <ErrorBlock
                  title="failed to delete this event"
                  message={
                    deleteError.info?.message || "failed to delete event"
                  }
                />
              )}
              {!deletionPending && (
                <>
                  <button onClick={handleStopDelete} className="button-text">
                    cancel
                  </button>
                  <button onClick={handleDelete} className="button">
                    Delete
                  </button>
                </>
              )}
            </div>
          </Modal>
        </>
      )}

      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
