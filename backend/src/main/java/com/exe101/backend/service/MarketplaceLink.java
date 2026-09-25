package com.exe101.backend.service;
import com.exe101.backend.model.Marketplace;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
public record MarketplaceLink(Marketplace marketplace, String id, String url) {
    public static MarketplaceLink parse(String input) {
        if(input==null || input.isBlank() || input.length()>2000) throw new IllegalArgumentException("Vui lòng nhập link sản phẩm hợp lệ");
        URI uri;
        try { uri=URI.create(input.trim()); } catch(Exception ex) { throw new IllegalArgumentException("Link không hợp lệ"); }
        String host=uri.getHost();
        if(host==null || !List.of("http","https").contains(Objects.requireNonNullElse(uri.getScheme(),"").toLowerCase(Locale.ROOT))
                || uri.getUserInfo()!=null || (uri.getPort()!=-1 && uri.getPort()!=443 && uri.getPort()!=80))
            throw new IllegalArgumentException("Vui lòng nhập link http/https từ Xianyu hoặc Taobao");
        host=host.toLowerCase(Locale.ROOT);
        Marketplace marketplace;
        if(host.equals("goofish.com") || host.endsWith(".goofish.com") || host.equals("2.taobao.com")) marketplace=Marketplace.XIANYU;
        else if(host.equals("tmall.com") || host.endsWith(".tmall.com")) marketplace=Marketplace.TMALL;
        else if(host.equals("taobao.com") || host.endsWith(".taobao.com") || host.equals("m.tb.cn")) marketplace=Marketplace.TAOBAO;
        else throw new IllegalArgumentException("Chỉ hỗ trợ domain Xianyu, Taobao hoặc Tmall");
        String id=null;
        if(uri.getRawQuery()!=null) for(String pair:uri.getRawQuery().split("&")) {
            String[] parts=pair.split("=",2);
            if(parts.length==2 && URLDecoder.decode(parts[0],StandardCharsets.UTF_8).equals("id")) {
                String value=URLDecoder.decode(parts[1],StandardCharsets.UTF_8);
                if(!value.matches("[0-9]{1,30}")) throw new IllegalArgumentException("ID sản phẩm không hợp lệ");
                if(id!=null && !id.equals(value)) throw new IllegalArgumentException("Link chứa nhiều ID khác nhau");
                id=value;
            }
        }
        if(marketplace==Marketplace.XIANYU && id==null) throw new IllegalArgumentException("Vui lòng mở link chia sẻ Xianyu và sao chép link sản phẩm có id");
        return new MarketplaceLink(marketplace,id,uri.toString());
    }
}
