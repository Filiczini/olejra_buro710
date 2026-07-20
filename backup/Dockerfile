FROM alpine:3.21

RUN apk add --no-cache postgresql-client rclone

COPY scripts/backup.sh /backup.sh
RUN chmod +x /backup.sh

# Daily at 03:00
RUN echo "0 3 * * * /backup.sh >> /var/log/backup.log 2>&1" > /etc/crontabs/root

CMD ["crond", "-f", "-l", "2"]
