import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();

  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const {
    mutate,
    isPending: updatePending,
    isError: updatingError,
    error: updateError,
  } = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/events");
    },
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="can't able to load Data"
          message={
            error.info?.message || "please try again later after Some time"
          }
        />
        <div className="center">
          <Link to="..">
            <button className="button">Okay</button>
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <>
        <EventForm inputData={data} onSubmit={handleSubmit}>
          {isPending && <p> Loading ...</p>}
          {!isPending && (
            <>
              <Link to="../" className="button-text">
                <button disabled={updatePending} className="button-text">
                  Cancel
                </button>
              </Link>
              <button type="submit" className="button">
                {updatePending ? "updating..." : "update"}
              </button>
            </>
          )}
        </EventForm>
      </>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
