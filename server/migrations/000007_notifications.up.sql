CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'comment', 'user')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient_id ON notifications (recipient_id);
CREATE INDEX idx_notifications_actor_id ON notifications (actor_id);
CREATE INDEX idx_notifications_created_at_desc ON notifications (created_at DESC);
