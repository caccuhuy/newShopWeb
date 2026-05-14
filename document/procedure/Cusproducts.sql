use E_COM;
go
create or alter procedure vw_CustomerProducts 
as begin 
SELECT p.product_id
        , p.product_name
        , p.brand
        , p.unit_price
        , p.image_url
        , p.specs_json
        ,c.cat_name AS category_name
        ,(SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) AS stock
FROM Product p      
LEFT JOIN Categories c ON p.cat_id = c.cat_id
ORDER BY p.product_name
end;
go

create or alter procedure sp_SearchProducts
    @query NVARCHAR(255) = NULL
    ,@category NVARCHAR(100) = NULL
    ,@brand NVARCHAR(100) = NULL
    ,@minPrice DECIMAL(18, 2) = NULL
    ,@maxPrice DECIMAL(18, 2) = NULL
as begin 
set nocount on ;
    SELECT p.product_id, p.product_name, p.brand, p.unit_price, p.image_url, p.specs_json,
           c.cat_name AS category_name,
           (SELECT COUNT(*) FROM Stock_Units su WHERE su.product_id = p.product_id AND su.status = 1) AS stock
    FROM Product p 
    LEFT JOIN Categories c ON p.cat_id = c.cat_id
    WHERE 
        (@query IS NULL OR (p.product_name LIKE '%' + @query + '%' OR p.brand LIKE '%' + @query + '%' OR c.cat_name LIKE '%' + @query + '%'))
        AND (@category IS NULL OR c.cat_name = @category)
        AND (@brand IS NULL OR p.brand = @brand)
        AND (@minPrice IS NULL OR p.unit_price >= @minPrice)
        AND (@maxPrice IS NULL OR p.unit_price <= @maxPrice)
    ORDER BY p.product_name;
end ;
go 