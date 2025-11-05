import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  getMessages,
  sendMessage,
  getConversations,
  acceptConversation,
  initiateSale,
  confirmSale,
  rateSellerForConversation,
} from "../api/messages.jsx";
import { createComplaint } from "../api/complaints.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaComments, FaFlag } from "react-icons/fa";

const Messages = () => {
  const { user, token } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [markingSold, setMarkingSold] = useState(false);
  const [confirmingSale, setConfirmingSale] = useState(false);
  const [rating, setRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: "",
    description: "",
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  const reportTypes = [
    { value: "inappropriate_product", label: "Inappropriate Product" },
    { value: "misbehavior", label: "Misbehavior" },
    { value: "spam", label: "Spam Messages" },
    { value: "harassment", label: "Harassment" },
    { value: "other", label: "Other" },
  ];

  const handleReport = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      toast.error("You must be logged in to report.");
      return;
    }

    if (!reportForm.type || !reportForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmittingReport(true);
    try {
      const otherUser = getOtherParticipant(selectedConversation);
      await createComplaint(
        {
          reportedUser: otherUser._id,
          type: reportForm.type,
          description: reportForm.description,
        },
        token
      );

      toast.success("Report submitted successfully");
      setShowReportModal(false);
      setReportForm({ type: "", description: "" });
    } catch (err) {
      toast.error("Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || !token) return;
      try {
        const convos = await getConversations(token);
        setConversations(convos);
      } catch (err) {
        console.error("Failed to load conversations:", err);
        toast.error("Failed to load conversations.");
      }
    };
    fetchConversations();
  }, [user, token]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    const fetchMessagesForConversation = async () => {
      if (!selectedConversation) return;
      setLoading(true);
      try {
        // Get the other participant
        const otherParticipant = selectedConversation.participants.find(
          (p) => p._id !== user?.id && p?._id !== user?._id
        );
        if (!otherParticipant) return;

        const msgs = await getMessages(
          otherParticipant._id,
          selectedConversation.listing?._id,
          token
        );
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to load messages:", err);
        toast.error("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };
    if (selectedConversation && token) fetchMessagesForConversation();
  }, [selectedConversation, token, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const receiver = selectedConversation.participants.find(
        (p) => p._id !== user?.id && p?._id !== user?._id
      );
      if (!receiver) {
        toast.error("Invalid conversation");
        return;
      }

      await sendMessage(
        {
          receiver: receiver._id || receiver.id,
          content: newMessage,
          conversationId: selectedConversation._id,
          listing: selectedConversation.listing?._id,
        },
        token
      );

      setNewMessage("");
      toast.success("Message sent!");

      // Refresh messages
      const msgs = await getMessages(
        receiver._id || receiver.id,
        selectedConversation.listing?._id,
        token
      );
      setMessages(msgs);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConversation = async (conversationId) => {
    try {
      await acceptConversation(conversationId, token);
      toast.success("Conversation accepted!");
      // Refresh conversations
      const convos = await getConversations(token);
      setConversations(convos);
    } catch (err) {
      toast.error("Failed to accept conversation.");
    }
  };

  const handleInitiateSale = async () => {
    if (!selectedConversation?._id) return;

    setMarkingSold(true);
    try {
      await initiateSale(selectedConversation._id, token);
      toast.success(
        "Sale request sent to buyer! They will receive a notification."
      );

      // Refresh conversations and messages
      const convos = await getConversations(token);
      setConversations(convos);
      const updatedConvo = convos.find(
        (c) => c._id === selectedConversation._id
      );
      if (updatedConvo) {
        setSelectedConversation(updatedConvo);
        const otherParticipant = updatedConvo.participants.find(
          (p) => p._id !== user?.id && p?._id !== user?._id
        );
        if (otherParticipant) {
          const msgs = await getMessages(
            otherParticipant._id,
            updatedConvo.listing?._id,
            token
          );
          setMessages(msgs);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate sale.");
    } finally {
      setMarkingSold(false);
    }
  };

  const handleConfirmSale = async () => {
    if (!selectedConversation?._id) return;

    setConfirmingSale(true);
    try {
      await confirmSale(selectedConversation._id, token);
      toast.success("Purchase confirmed! The item is now sold to you.");

      // Refresh conversations and messages
      const convos = await getConversations(token);
      setConversations(convos);
      const updatedConvo = convos.find(
        (c) => c._id === selectedConversation._id
      );
      if (updatedConvo) {
        setSelectedConversation(updatedConvo);
        const otherParticipant = updatedConvo.participants.find(
          (p) => p._id !== user?.id && p?._id !== user?._id
        );
        if (otherParticipant) {
          const msgs = await getMessages(
            otherParticipant._id,
            updatedConvo.listing?._id,
            token
          );
          setMessages(msgs);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm sale.");
    } finally {
      setConfirmingSale(false);
    }
  };

  const isBuyerInSelected =
    selectedConversation &&
    String(
      selectedConversation?.listing?.seller?._id ||
        selectedConversation?.listing?.seller
    ) !== String(user?.id || user?._id);
  const shouldForceRating = !!(
    selectedConversation &&
    selectedConversation.saleStatus === "confirmed" &&
    isBuyerInSelected &&
    selectedConversation.buyerRated === false
  );

  const submitRating = async () => {
    if (!selectedConversation?._id || rating < 1 || rating > 5) {
      toast.error("Please select a rating");
      return;
    }
    setSubmittingRating(true);
    try {
      await rateSellerForConversation(selectedConversation._id, rating, token);
      toast.success("Thanks for rating the seller!");
      // Refresh conversations to update buyerRated
      const convos = await getConversations(token);
      setConversations(convos);
      const updatedConvo = convos.find(
        (c) => c._id === selectedConversation._id
      );
      if (updatedConvo) setSelectedConversation(updatedConvo);
      setRating(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  // Helper to get the other participant
  const getOtherParticipant = (conversation) => {
    if (!user || !conversation?.participants) return null;
    return conversation.participants.find(
      (p) =>
        String(p._id) !== String(user.id) && String(p._id) !== String(user._id)
    );
  };

  // Helper to check if message is from current user
  const isMessageFromCurrentUser = (message) => {
    if (!user || !message) return false;
    const senderId = message.sender?._id || message.sender;
    const userId = user._id || user.id;
    return String(senderId) === String(userId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="flex gap-6">
        {/* Conversations List */}
        <aside className="w-64 bg-white rounded-lg shadow p-4 h-[32rem] overflow-y-auto">
          <h2 className="font-semibold mb-4">Conversations</h2>
          {conversations.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <FaComments className="mx-auto mb-2 text-gray-400" size={32} />
              <p>No conversations yet</p>
              <p className="text-sm">
                Start by messaging a seller from a product page
              </p>
            </div>
          ) : (
            <ul>
              {conversations.map((convo) => {
                const otherUser = getOtherParticipant(convo);
                const isPending = convo.status === "pending";
                const canAccept =
                  isPending &&
                  String(convo.initiatedBy) !== String(user?.id) &&
                  String(convo.initiatedBy) !== String(user?._id);

                return (
                  <li
                    key={convo._id}
                    className={`p-3 rounded cursor-pointer mb-2 border ${
                      selectedConversation?._id === convo._id
                        ? "bg-indigo-100 border-indigo-300"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                    onClick={() => setSelectedConversation(convo)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {otherUser?.name || "Unknown User"}
                          {isPending && canAccept && (
                            <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                              New Request
                            </span>
                          )}
                          {isPending && !canAccept && (
                            <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                              Waiting
                            </span>
                          )}
                        </p>
                        {convo.listing && (
                          <p className="text-sm text-gray-600">
                            {convo.listing.title}
                          </p>
                        )}
                        {convo.createdAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Requested:{" "}
                            {new Date(convo.createdAt).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    {canAccept && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptConversation(convo._id);
                        }}
                        className="mt-2 w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Accept
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Chat Area */}
        <main className="flex-1 bg-white rounded-lg shadow p-6 flex flex-col h-[32rem]">
          {!selectedConversation ? (
            <div className="text-gray-500 flex-1 flex items-center justify-center">
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-4">
                  <div className="font-semibold">
                    {getOtherParticipant(selectedConversation)?.name ||
                      "Unknown User"}
                  </div>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                  >
                    <FaFlag size={12} /> Report User
                  </button>
                </div>
                {selectedConversation.status === "accepted" &&
                  selectedConversation.listing &&
                  !selectedConversation.listing.isSold && (
                    <>
                      {/* Seller: Show "Sell Item" button */}
                      {String(
                        selectedConversation.listing.seller?._id ||
                          selectedConversation.listing.seller
                      ) === String(user?.id || user?._id) &&
                        selectedConversation.saleStatus !==
                          "pending_confirmation" &&
                        selectedConversation.saleStatus !== "confirmed" && (
                          <button
                            onClick={handleInitiateSale}
                            disabled={markingSold}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
                          >
                            <FaCheckCircle />
                            {markingSold ? "Sending..." : "Sell Item"}
                          </button>
                        )}
                      {/* Buyer: Show confirmation button when sale is pending */}
                      {String(
                        selectedConversation.listing.seller?._id ||
                          selectedConversation.listing.seller
                      ) !== String(user?.id || user?._id) &&
                        selectedConversation.saleStatus ===
                          "pending_confirmation" && (
                          <button
                            onClick={handleConfirmSale}
                            disabled={confirmingSale}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                          >
                            <FaCheckCircle />
                            {confirmingSale
                              ? "Confirming..."
                              : "Confirm Purchase"}
                          </button>
                        )}
                      {/* Seller: Show waiting message when sale is pending */}
                      {String(
                        selectedConversation.listing.seller?._id ||
                          selectedConversation.listing.seller
                      ) === String(user?.id || user?._id) &&
                        selectedConversation.saleStatus ===
                          "pending_confirmation" && (
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm">
                            Waiting for buyer confirmation...
                          </span>
                        )}
                    </>
                  )}
              </div>

              {selectedConversation.listing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">
                        {selectedConversation.listing.title}
                      </h4>
                      <p className="text-sm text-blue-700">
                        ${selectedConversation.listing.price} •{" "}
                        {selectedConversation.listing.category}
                      </p>
                      {selectedConversation.saleStatus ===
                        "pending_confirmation" &&
                        String(
                          selectedConversation.listing.seller?._id ||
                            selectedConversation.listing.seller
                        ) !== String(user?.id || user?._id) && (
                          <p className="text-xs text-yellow-700 mt-1 font-medium">
                            ⚠️ Sale confirmation requested - Please confirm your
                            purchase
                          </p>
                        )}
                    </div>
                    {selectedConversation.listing.isSold ||
                    selectedConversation.saleStatus === "confirmed" ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        SOLD
                      </span>
                    ) : selectedConversation.saleStatus ===
                        "pending_confirmation" &&
                      String(
                        selectedConversation.listing.seller?._id ||
                          selectedConversation.listing.seller
                      ) === String(user?.id || user?._id) ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        Pending
                      </span>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
                {loading ? (
                  <div>Loading...</div>
                ) : messages.length === 0 ? (
                  <div className="text-gray-400">
                    {selectedConversation.status === "pending"
                      ? "Waiting for acceptance..."
                      : "No messages yet"}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSender = isMessageFromCurrentUser(msg);
                    return (
                      <div
                        key={msg._id}
                        className={`mb-2 flex ${
                          isSender ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`px-3 py-2 rounded-lg max-w-xs ${
                            isSender
                              ? "bg-indigo-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <div>{msg.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              isSender
                                ? "text-indigo-100 text-right"
                                : "text-gray-500 text-left"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    selectedConversation.status === "pending"
                      ? "Waiting for acceptance..."
                      : "Type your message..."
                  }
                  className="flex-1 border rounded px-3 py-2"
                  disabled={
                    !selectedConversation ||
                    selectedConversation.status !== "accepted"
                  }
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  disabled={
                    !selectedConversation ||
                    !newMessage.trim() ||
                    selectedConversation.status !== "accepted"
                  }
                >
                  Send
                </button>
              </form>
            </>
          )}
        </main>
      </div>
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Report User</h3>
            <form onSubmit={handleReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Reason for Report *
                </label>
                <select
                  value={reportForm.type}
                  onChange={(e) =>
                    setReportForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select a reason</option>
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) =>
                    setReportForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  rows="4"
                  placeholder="Please provide details about your report..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {submittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Force rating modal for buyer after confirmation */}
      {shouldForceRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-2">Rate the Seller</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please rate your experience with the seller. This helps the
              community.
            </p>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    rating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={submitRating}
                disabled={submittingRating || rating === 0}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
