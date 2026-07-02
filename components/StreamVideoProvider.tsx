import {
  StreamVideo,
  StreamVideoClient,
  type DeepPartial,
  type Theme,
  type User,
} from "@stream-io/video-react-native-sdk";
import { useAuth, useUser } from "@clerk/expo";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  fetchStreamAudioSession,
  type StreamAudioSession,
} from "@/lib/streamAudio";

type StreamVideoProviderState = {
  error: string | null;
  isConnecting: boolean;
  session: StreamAudioSession | null;
};

const StreamVideoStatusContext = createContext<StreamVideoProviderState>({
  error: null,
  isConnecting: false,
  session: null,
});

export function useLinguaStreamVideo() {
  return useContext(StreamVideoStatusContext);
}

export function LinguaStreamVideoProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [session, setSession] = useState<StreamAudioSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { bottom, left, right, top } = useSafeAreaInsets();

  const userName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? undefined;
  const userImage = user?.imageUrl;
  const userId = user?.id;

  // Clerk's getToken (and derived user strings) get a fresh identity on every
  // render. Keeping them in refs stops the connect effect from re-running each
  // render — that loop tears the StreamVideo wrapper down and remounts the
  // whole app tree (visible flicker/bouncing).
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const userNameRef = useRef(userName);
  userNameRef.current = userName;
  const userImageRef = useRef(userImage);
  userImageRef.current = userImage;

  useEffect(() => {
    let cancelled = false;
    let activeClient: StreamVideoClient | null = null;

    async function connectStreamVideo() {
      if (!isLoaded || !isSignedIn) {
        setClient(null);
        setSession(null);
        setError(null);
        setIsConnecting(false);
        return;
      }

      setIsConnecting(true);
      setError(null);

      try {
        const clerkToken = await getTokenRef.current();
        if (!clerkToken) {
          throw new Error("Clerk session token is unavailable.");
        }

        const nextSession = await fetchStreamAudioSession({
          clerkToken,
          payload: {
            intent: "token",
            userImage: userImageRef.current,
            userName: userNameRef.current,
          },
        });

        if (cancelled) {
          return;
        }

        const streamUser: User = {
          id: nextSession.userId,
          image: nextSession.userImage,
          name: nextSession.userName,
        };
        const tokenProvider = async () => {
          const freshClerkToken = await getTokenRef.current();
          if (!freshClerkToken) {
            throw new Error("Clerk session token is unavailable.");
          }

          const freshSession = await fetchStreamAudioSession({
            clerkToken: freshClerkToken,
            payload: {
              intent: "token",
              userImage: userImageRef.current,
              userName: userNameRef.current,
            },
          });

          return freshSession.token;
        };

        activeClient = StreamVideoClient.getOrCreateInstance({
          apiKey: nextSession.apiKey,
          token: nextSession.token,
          tokenProvider,
          user: streamUser,
        });

        setSession(nextSession);
        setClient(activeClient);
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(nextError));
          setClient(null);
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setIsConnecting(false);
        }
      }
    }

    void connectStreamVideo();

    return () => {
      cancelled = true;
      void activeClient?.disconnectUser();
      setClient(null);
    };
    // Reconnect only on real auth-state changes — not on every render.
  }, [isLoaded, isSignedIn, userId]);

  const streamTheme = useMemo<DeepPartial<Theme>>(
    () =>
      ({
        variants: {
          insets: { bottom, left, right, top },
        },
      }) as unknown as DeepPartial<Theme>,
    [bottom, left, right, top],
  );

  const value = useMemo(
    () => ({ error, isConnecting, session }),
    [error, isConnecting, session],
  );

  return (
    <StreamVideoStatusContext.Provider value={value}>
      {client ? (
        <StreamVideo client={client} style={streamTheme}>
          {children}
        </StreamVideo>
      ) : (
        children
      )}
    </StreamVideoStatusContext.Provider>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unable to connect Stream Video.";
}
