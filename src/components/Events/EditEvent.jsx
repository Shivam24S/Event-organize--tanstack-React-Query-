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

    // now here i want to optimistic update that why i don't want use onSuccess property here
    // what is optimistic update it will show immediately when something we change it will reflect on ui immediately
    // previously we have to fetch update data to see update but using react query properties you can do that
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["events"] });

    // },

    // now here onward i m doing optimistic update

    onMutate: (data) => {
      // getting data from mutate
      const newData = data.event;

      // if our mutation failed in backend like we can update in front end it will show immediately
      // but what if user doesn't provide correct data backend will not accept to overcome this problem
      // like if we have backend error then we will roll back instead of updating we will show previously entered Data

      // 3  // getting previous data and we have to set this data on if error occurred for that
      // we have to add another react query property

      const previousEvent = queryClient.getQueriesData([
        "events",
        { id: params.id },
      ]);

      // 3  // getting previous data and we have to set this data on if error occurred for that
      // we have to add another react query property

      //  2.   // i want to cancel all http requests for this key  before setting data
      // if we don't do that we will get old values or new after updating

      queryClient.cancelQueries({ queryKey: ["events", { id: params.id }] });

      //  1.   // setting query manually for instant update  first providing key where want instant update
      // second data which want to update locally we getting through mutate
      queryClient.setQueriesData(["events", { id: params.id }], newData);

      // returning previous event
      return { previousEvent };
    },
    // if error occurred then rolling back to old data
    onError: (context) => {
      queryClient.setQueriesData(
        ["events", { id: params.id }],
        context.previousEvent
      );
    },

    // now for updating data for this key and assuring that our front and backend in sync we will refetch data for this key
    // to do that

    onSettled: () => {
      queryClient.invalidateQueries(["events", { id: params.id }]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate("../");
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
