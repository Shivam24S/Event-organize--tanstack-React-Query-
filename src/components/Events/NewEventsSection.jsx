import { useQuery } from "@tanstack/react-query";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection() {
  const { data, isPending, isError, error } = useQuery({
    // react query important features

    queryKey: ["events", { max: 3 }], // query key used for cached data checking with same id

    // queryFn:({signal})=> fetchEvents({signal,max:3})  //before
    // as you can see max:3 used two times we can redundant that using passing query key and access his first parameter
    // doing so we don't need to repeat our self

    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }), //after      // http request function
    staleTime: 5000, // stale time is a time when our data refetch automatically after caching loaded data default is 0 but we can define our time when http request sent using stale time

    // gcTime: 1000,   // gc time is garbage collection time it means is will clear the cache data after default five minutes
    //  as you can see we can define garbage collection time so cached data can be cleared

    // note :images are  not cached by react query or react it cached by browser
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info ? error.message : "failed to fetch Data"}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
