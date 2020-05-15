location /view/ {
    rewrite ^/view/\d+ /index.html break;
}
location /list {
    return 301 /;
}
